import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Seed projects
  const projectsData = [
    { title: "New Services", category: "NEW_SERVICES", description: "New service pages and offerings", color: "#9333ea" },
    { title: "Bugs", category: "BUGS", description: "Bug fixes and issues", color: "#ef4444" },
    { title: "Features", category: "FEATURES", description: "New features and improvements", color: "#3b82f6" },
    { title: "Website", category: "WEBSITE", description: "Website content and design", color: "#d946ef" },
  ];

  const projects: Record<string, { id: string }> = {};
  for (const p of projectsData) {
    const existing = await db.project.findFirst({ where: { category: p.category } });
    if (existing) {
      projects[p.category] = existing;
    } else {
      projects[p.category] = await db.project.create({ data: p });
    }
  }

  // Seed team members
  const membersData = [
    { name: "Ida", role: "Copywriter" },
    { name: "Leo", role: "Community Manager" },
    { name: "Selma", role: "Community Manager" },
    { name: "Noah", role: "Growth Strategist" },
    { name: "Elias", role: "SEO Specialist" },
  ];

  const members: Record<string, { id: string }> = {};
  for (const m of membersData) {
    const existing = await db.teamMember.findFirst({ where: { name: m.name } });
    if (existing) {
      members[m.name] = existing;
    } else {
      members[m.name] = await db.teamMember.create({ data: m });
    }
  }

  // Today's due date at 21:00 Stockholm time
  const today = new Date();
  const due = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0, 0); // 21:00 CET = 20:00 UTC

  const tasksData = [
    {
      title: "Copywriting service pages",
      description: "Write compelling copy for all service pages including descriptions, features, and CTAs.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      progress: 60,
      dueDate: due,
      projectId: projects["NEW_SERVICES"].id,
      assigneeId: members["Ida"].id,
      assigneeName: "Ida",
    },
    {
      title: "Community Management service",
      description: "Create the Community Management service offering — scope, pricing, and deliverables.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      progress: 40,
      dueDate: due,
      projectId: projects["NEW_SERVICES"].id,
      assigneeId: members["Leo"].id,
      assigneeName: "Leo & Selma",
    },
    {
      title: "Growth Strategy service",
      description: "Define the Growth Strategy service, outline methodology and packages.",
      status: "BACKLOG",
      priority: "HIGH",
      progress: 0,
      dueDate: due,
      projectId: projects["NEW_SERVICES"].id,
      assigneeId: members["Noah"].id,
      assigneeName: "Noah",
    },
    {
      title: "SEO Audit service",
      description: "Finalize the SEO Audit service page, checklist, and pricing structure.",
      status: "REVIEW",
      priority: "HIGH",
      progress: 90,
      dueDate: due,
      projectId: projects["NEW_SERVICES"].id,
      assigneeId: members["Elias"].id,
      assigneeName: "Elias",
    },
  ];

  const created = [];
  for (const t of tasksData) {
    const existing = await db.task.findFirst({ where: { title: t.title } });
    if (!existing) {
      const task = await db.task.create({
        data: t,
        include: { assignee: true, project: true },
      });
      created.push(task);

      // Add initial update
      await db.taskUpdate.create({
        data: {
          taskId: task.id,
          authorName: t.assigneeName || "Team",
          content: `Task created. Current progress: ${t.progress}%.`,
        },
      });
    } else {
      created.push(existing);
    }
  }

  return NextResponse.json({ ok: true, projects: Object.values(projects), members: Object.values(members), tasks: created });
}
