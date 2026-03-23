import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

function isAdmin(session: { user: { role?: string } } | null) {
  return session && (session.user as { role?: string }).role === "ADMIN";
}

// GET all enterprise data for an order (assignments, notes, tasks, files, activities)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!isAdmin(session)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;

  const [assignments, notes, tasks, files, activities] = await Promise.all([
    db.orderAssignment.findMany({ where: { orderId: id }, orderBy: { assignedAt: "desc" } }),
    db.orderNote.findMany({ where: { orderId: id }, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] }),
    db.orderTask.findMany({ where: { orderId: id }, orderBy: { sortOrder: "asc" } }),
    db.orderFile.findMany({ where: { orderId: id }, orderBy: { createdAt: "desc" } }),
    db.orderActivity.findMany({ where: { orderId: id }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return NextResponse.json({ assignments, notes, tasks, files, activities });
}

// POST — create assignment, note, task, file, or log activity
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!isAdmin(session)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { type, ...data } = body;

  // Verify order exists
  const order = await db.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  switch (type) {
    case "assignment": {
      const assignment = await db.orderAssignment.create({
        data: { orderId: id, memberName: data.memberName, memberRole: data.memberRole },
      });
      await db.orderActivity.create({
        data: { orderId: id, action: "ASSIGNED", description: `${data.memberName} assigned as ${data.memberRole}`, actorName: session!.user.name || "Admin" },
      });
      return NextResponse.json(assignment);
    }

    case "note": {
      const note = await db.orderNote.create({
        data: { orderId: id, authorName: session!.user.name || "Admin", content: data.content, pinned: data.pinned || false },
      });
      return NextResponse.json(note);
    }

    case "task": {
      const taskCount = await db.orderTask.count({ where: { orderId: id } });
      const task = await db.orderTask.create({
        data: { orderId: id, title: data.title, assignedTo: data.assignedTo || null, sortOrder: taskCount },
      });
      await db.orderActivity.create({
        data: { orderId: id, action: "TASK_ADDED", description: `Task added: ${data.title}`, actorName: session!.user.name || "Admin" },
      });
      return NextResponse.json(task);
    }

    case "file": {
      const file = await db.orderFile.create({
        data: {
          orderId: id,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          fileSize: data.fileSize || null,
          fileType: data.fileType || null,
          uploadedBy: session!.user.name || "Admin",
          visibleToCustomer: data.visibleToCustomer ?? true,
        },
      });
      await db.orderActivity.create({
        data: { orderId: id, action: "FILE_UPLOADED", description: `File uploaded: ${data.fileName}`, actorName: session!.user.name || "Admin" },
      });
      return NextResponse.json(file);
    }

    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
}

// PATCH — update task, note, order details
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!isAdmin(session)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { type, itemId, ...data } = body;

  switch (type) {
    case "task": {
      const updateData: Record<string, unknown> = {};
      if (data.completed !== undefined) {
        updateData.completed = data.completed;
        updateData.completedAt = data.completed ? new Date() : null;
      }
      if (data.title) updateData.title = data.title;
      const task = await db.orderTask.update({ where: { id: itemId }, data: updateData });
      return NextResponse.json(task);
    }

    case "note": {
      const note = await db.orderNote.update({
        where: { id: itemId },
        data: { pinned: data.pinned ?? undefined, content: data.content ?? undefined },
      });
      return NextResponse.json(note);
    }

    case "order": {
      const orderData: Record<string, unknown> = {};
      if (data.priority) orderData.priority = data.priority;
      if (data.deadline !== undefined) orderData.deadline = data.deadline ? new Date(data.deadline) : null;
      if (data.estimatedHours !== undefined) orderData.estimatedHours = data.estimatedHours;
      if (data.assignedTeam) orderData.assignedTeam = data.assignedTeam;
      if (data.status) {
        orderData.status = data.status;
        await db.orderActivity.create({
          data: { orderId: id, action: "STATUS_CHANGED", description: `Status changed to ${data.status}`, actorName: session!.user.name || "Admin" },
        });
      }
      const order = await db.order.update({ where: { id }, data: orderData });
      return NextResponse.json(order);
    }

    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
}

// DELETE — remove assignment, note, task, file
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!isAdmin(session)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const { type, itemId } = body;

  switch (type) {
    case "assignment":
      await db.orderAssignment.delete({ where: { id: itemId } });
      break;
    case "note":
      await db.orderNote.delete({ where: { id: itemId } });
      break;
    case "task":
      await db.orderTask.delete({ where: { id: itemId } });
      break;
    case "file":
      await db.orderFile.delete({ where: { id: itemId } });
      break;
    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
