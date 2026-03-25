#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailOrchestrator = void 0;
const email_listener_1 = require("./email-listener");
const email_ai_processor_1 = require("./email-ai-processor");
/**
 * Email Orchestrator
 * Runs email polling + AI processing in a loop
 */
class EmailOrchestrator {
    constructor(intervalMs = 5 * 60 * 1000) {
        this.running = false;
        this.cycling = false;
        // Default: 5 minutes
        this.listener = new email_listener_1.EmailListener();
        this.processor = new email_ai_processor_1.EmailAIProcessor();
        this.intervalMs = intervalMs;
    }
    /**
     * Run one cycle: fetch emails → process pending → generate AI drafts
     */
    async runCycle() {
        console.log('\n[Orchestrator] ═════════════════════════════════════════');
        console.log(`[Orchestrator] Starting cycle at ${new Date().toISOString()}`);
        try {
            // Step 1: Fetch new emails from IMAP
            console.log('[Orchestrator] Step 1: Fetching unread emails...');
            await this.listener.poll();
            // Step 2: Process pending emails with AI
            console.log('[Orchestrator] Step 2: Processing pending emails with AI...');
            await this.processor.processPendingEmails();
            console.log('[Orchestrator] ✅ Cycle complete');
        }
        catch (error) {
            console.error('[Orchestrator] ❌ Cycle failed:', error);
        }
        console.log('[Orchestrator] ═════════════════════════════════════════\n');
    }
    /**
     * Start continuous polling
     */
    async start() {
        if (this.running) {
            console.log('[Orchestrator] Already running');
            return;
        }
        this.running = true;
        console.log(`[Orchestrator] Starting email orchestrator (interval: ${this.intervalMs / 1000}s)`);
        // Run first cycle immediately
        await this.runCycle();
        // Then run on interval — skip if previous cycle is still running
        setInterval(async () => {
            if (this.running && !this.cycling) {
                this.cycling = true;
                try {
                    await this.runCycle();
                }
                finally {
                    this.cycling = false;
                }
            }
        }, this.intervalMs);
        console.log('[Orchestrator] Running. Press Ctrl+C to stop.');
    }
    /**
     * Stop polling
     */
    stop() {
        this.running = false;
        console.log('[Orchestrator] Stopped');
    }
}
exports.EmailOrchestrator = EmailOrchestrator;
// ─── CLI Entry Point ──────────────────────────────────────────────────────────
if (require.main === module) {
    const orchestrator = new EmailOrchestrator();
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n[Orchestrator] Received SIGINT, shutting down...');
        orchestrator.stop();
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        console.log('\n[Orchestrator] Received SIGTERM, shutting down...');
        orchestrator.stop();
        process.exit(0);
    });
    orchestrator.start().catch((error) => {
        console.error('[Orchestrator] Fatal error:', error);
        process.exit(1);
    });
}
