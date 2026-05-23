import { loadEnvFile } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  activitiesTable,
  leadsTable,
  tasksTable,
  teamMembersTable,
  usersTable,
} from "@workspace/db/schema";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

loadEnvFile(path.resolve(currentDir, "../../apps/backend/.env"));

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be set");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const TEAM = [
  { name: "Alex Sterling", email: "alex@forgecrm.io", role: "Senior BDA", department: "Sales", initials: "AS", avatarColor: "#2563eb", status: "active", dealsWon: 12, revenue: 680000, leadsAssigned: 8 },
  { name: "Sarah Chen", email: "sarah@forgecrm.io", role: "Account Executive", department: "Sales", initials: "SC", avatarColor: "#7c3aed", status: "active", dealsWon: 9, revenue: 512000, leadsAssigned: 7 },
  { name: "Marcus Reid", email: "marcus@forgecrm.io", role: "Sales Engineer", department: "Pre-Sales", initials: "MR", avatarColor: "#0891b2", status: "active", dealsWon: 7, revenue: 394000, leadsAssigned: 5 },
  { name: "Priya Nair", email: "priya@forgecrm.io", role: "BDA", department: "Sales", initials: "PN", avatarColor: "#059669", status: "active", dealsWon: 5, revenue: 268000, leadsAssigned: 6 },
  { name: "Leo Strand", email: "leo@forgecrm.io", role: "Account Manager", department: "Customer Success", initials: "LS", avatarColor: "#dc2626", status: "active", dealsWon: 11, revenue: 590000, leadsAssigned: 4 },
  { name: "Nina Falco", email: "nina@forgecrm.io", role: "BDA", department: "Sales", initials: "NF", avatarColor: "#d97706", status: "away", dealsWon: 4, revenue: 195000, leadsAssigned: 3 },
];

const LEADS = [
  { name: "Sarah Connor", email: "s.connor@titan.com", company: "Titan Machining", phone: "+1 (555) 201-4444", stage: "new", priority: "high", value: 50000, source: "referral", assignedToName: "Alex Sterling", assignedToInitials: "AS", assignedToColor: "#2563eb", notes: "Interested in full platform. Demo scheduled.", dueDate: "Oct 12" },
  { name: "Marcus Wright", email: "m.wright@apex.com", company: "Apex Foundries", phone: "+1 (555) 312-8821", stage: "new", priority: "low", value: 42000, source: "linkedin", assignedToName: "Sarah Chen", assignedToInitials: "SC", assignedToColor: "#7c3aed", notes: "", dueDate: "Oct 14" },
  { name: "James Holden", email: "j.holden@steelcore.com", company: "SteelCore Dynamics", phone: "+1 (555) 419-0032", stage: "new", priority: "medium", value: 36000, source: "website", assignedToName: "Priya Nair", assignedToInitials: "PN", assignedToColor: "#059669", notes: "", dueDate: "Oct 18" },
  { name: "Kyle Reese", email: "k.reese@quantum.com", company: "Quantum Forge", phone: "+1 (555) 528-1199", stage: "contacted", priority: "medium", value: 85000, source: "cold-call", assignedToName: "Marcus Reid", assignedToInitials: "MR", assignedToColor: "#0891b2", notes: "Follow-up call booked for next Thursday.", dueDate: "Oct 15" },
  { name: "Elara Voss", email: "e.voss@orion.com", company: "Orion Manufacturing", phone: "+1 (555) 637-5544", stage: "contacted", priority: "low", value: 9000, source: "trade-show", assignedToName: "Nina Falco", assignedToInitials: "NF", assignedToColor: "#d97706", notes: "", dueDate: "Oct 20" },
  { name: "Darian Cole", email: "d.cole@nexavault.com", company: "NexaVault Systems", phone: "+1 (555) 741-2200", stage: "qualified", priority: "high", value: 124000, source: "referral", assignedToName: "Alex Sterling", assignedToInitials: "AS", assignedToColor: "#2563eb", notes: "Decision maker confirmed. Strong fit.", dueDate: "Oct 22" },
  { name: "Petra Hamm", email: "p.hamm@ironclad.com", company: "Ironclad Solutions", phone: "+1 (555) 853-9901", stage: "qualified", priority: "medium", value: 52000, source: "website", assignedToName: "Sarah Chen", assignedToInitials: "SC", assignedToColor: "#7c3aed", notes: "", dueDate: "Oct 28" },
  { name: "Leo Strand", email: "l.strand@veridian.com", company: "Veridian Robotics", phone: "+1 (555) 960-4433", stage: "negotiation", priority: "high", value: 210000, source: "referral", assignedToName: "Leo Strand", assignedToInitials: "LS", assignedToColor: "#dc2626", notes: "Contract under legal review. Close by end of Q4.", dueDate: "Sep 30" },
  { name: "Nina Falco", email: "n.falco@arcturus.com", company: "Arcturus Global", phone: "+1 (555) 071-6677", stage: "negotiation", priority: "medium", value: 75000, source: "linkedin", assignedToName: "Marcus Reid", assignedToInitials: "MR", assignedToColor: "#0891b2", notes: "", dueDate: "Oct 05" },
  { name: "Otto Braun", email: "o.braun@zenith.com", company: "Zenith Aerotech", phone: "+1 (555) 182-3344", stage: "proposal", priority: "high", value: 85000, source: "trade-show", assignedToName: "Alex Sterling", assignedToInitials: "AS", assignedToColor: "#2563eb", notes: "Proposal sent on Oct 1. Awaiting signature.", dueDate: "Oct 08" },
  { name: "Miles Dyson", email: "m.dyson@cyberdyne.com", company: "Cyberdyne Systems", phone: "+1 (555) 293-8800", stage: "won", priority: "closed", value: 320000, source: "referral", assignedToName: "Alex Sterling", assignedToInitials: "AS", assignedToColor: "#2563eb", notes: "Closed. Contract signed Sep 28.", dueDate: "Oct 01" },
  { name: "Tara Vance", email: "t.vance@pinnacle.com", company: "Pinnacle Manufacturing", phone: "+1 (555) 404-5566", stage: "lost", priority: "medium", value: 62000, source: "cold-call", assignedToName: "Priya Nair", assignedToInitials: "PN", assignedToColor: "#059669", notes: "Went with competitor. Budget constraints.", dueDate: "Sep 20" },
];

const TASKS = [
  { title: "Send follow-up email to Titan Machining", status: "todo", priority: "high", dueDate: "Oct 12", assignedToName: "Alex Sterling", assignedToInitials: "AS", leadName: "Sarah Connor" },
  { title: "Prepare proposal for NexaVault Systems", status: "todo", priority: "high", dueDate: "Oct 15", assignedToName: "Alex Sterling", assignedToInitials: "AS", leadName: "Darian Cole" },
  { title: "Schedule demo with Apex Foundries", status: "todo", priority: "medium", dueDate: "Oct 14", assignedToName: "Sarah Chen", assignedToInitials: "SC", leadName: "Marcus Wright" },
  { title: "Legal review for Veridian Robotics contract", status: "in-progress", priority: "high", dueDate: "Sep 30", assignedToName: "Leo Strand", assignedToInitials: "LS", leadName: "Leo Strand" },
  { title: "Update CRM data for Q3 pipeline", status: "in-progress", priority: "medium", dueDate: "Oct 10", assignedToName: "Priya Nair", assignedToInitials: "PN", leadName: "" },
  { title: "Call Orion Manufacturing re: pricing", status: "todo", priority: "low", dueDate: "Oct 20", assignedToName: "Nina Falco", assignedToInitials: "NF", leadName: "Elara Voss" },
  { title: "Follow up on Zenith Aerotech proposal", status: "todo", priority: "high", dueDate: "Oct 08", assignedToName: "Alex Sterling", assignedToInitials: "AS", leadName: "Otto Braun" },
  { title: "Onboarding checklist for Cyberdyne Systems", status: "done", priority: "medium", dueDate: "Oct 01", assignedToName: "Alex Sterling", assignedToInitials: "AS", leadName: "Miles Dyson" },
  { title: "Competitive analysis report Q4", status: "in-progress", priority: "medium", dueDate: "Oct 25", assignedToName: "Marcus Reid", assignedToInitials: "MR", leadName: "" },
  { title: "Sales team pipeline review", status: "done", priority: "low", dueDate: "Oct 07", assignedToName: "Sarah Chen", assignedToInitials: "SC", leadName: "" },
];

const ACTIVITIES = [
  { type: "deal_updated", title: "Cyberdyne Systems - Deal Closed", description: "Contract signed. $320,000 revenue recorded.", leadName: "Miles Dyson", userName: "Alex Sterling", userInitials: "AS", userColor: "#2563eb" },
  { type: "email", title: "Follow-up sent to NexaVault Systems", description: "Sent pricing breakdown and case studies.", leadName: "Darian Cole", userName: "Alex Sterling", userInitials: "AS", userColor: "#2563eb" },
  { type: "call", title: "Discovery call with Quantum Forge", description: "Discussed integration requirements. Positive outcome.", leadName: "Kyle Reese", userName: "Marcus Reid", userInitials: "MR", userColor: "#0891b2" },
  { type: "meeting", title: "Demo scheduled with Titan Machining", description: "Product demo for Oct 12 confirmed.", leadName: "Sarah Connor", userName: "Alex Sterling", userInitials: "AS", userColor: "#2563eb" },
  { type: "note", title: "Note added to Veridian Robotics", description: "Contract under legal review. Expecting signature by Sep 30.", leadName: "Leo Strand", userName: "Leo Strand", userInitials: "LS", userColor: "#dc2626" },
  { type: "lead_created", title: "New lead: SteelCore Dynamics", description: "Added via website form.", leadName: "James Holden", userName: "System", userInitials: "SY", userColor: "#6b7280" },
  { type: "deal_updated", title: "Arcturus Global moved to Negotiation", description: "Stage updated from Qualified to Negotiation.", leadName: "Nina Falco", userName: "Marcus Reid", userInitials: "MR", userColor: "#0891b2" },
  { type: "email", title: "Proposal sent to Zenith Aerotech", description: "Full proposal with pricing and timeline delivered.", leadName: "Otto Braun", userName: "Alex Sterling", userInitials: "AS", userColor: "#2563eb" },
];

async function seed() {
  console.log("Seeding database...");

  await db.delete(usersTable);
  await db.delete(activitiesTable);
  await db.delete(tasksTable);
  await db.delete(leadsTable);
  await db.delete(teamMembersTable);

  const [user] = await db
    .insert(usersTable)
    .values({
      email: "demo@forgecrm.io",
      passwordHash: "$2a$10$2k1cDk4B3d0A5f0mYI9gPukZ4u4Q6sQhM4m1FvQ8sK9w3Q2g9XG8u",
      name: "Demo User",
      role: "user",
    })
    .returning();

  await db.insert(teamMembersTable).values(TEAM.map((member) => ({ ...member, userId: user.id })));
  console.log(`Inserted ${TEAM.length} team members`);

  const insertedLeads = await db
    .insert(leadsTable)
    .values(LEADS.map((lead) => ({ ...lead, userId: user.id })))
    .returning();
  console.log(`Inserted ${insertedLeads.length} leads`);

  await db.insert(tasksTable).values(TASKS.map((task) => ({ ...task, userId: user.id })));
  console.log(`Inserted ${TASKS.length} tasks`);

  await db
    .insert(activitiesTable)
    .values(ACTIVITIES.map((activity) => ({ ...activity, userId: user.id })));
  console.log(`Inserted ${ACTIVITIES.length} activities`);

  console.log("Seed complete");
  await pool.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
