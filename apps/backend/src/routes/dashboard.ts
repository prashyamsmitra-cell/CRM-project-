import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable, tasksTable, activitiesTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);

router.get("/dashboard", async (req, res) => {
  const uid = req.session.userId!;
  const [allLeads, allTasks, recentActivities] = await Promise.all([
    db.select().from(leadsTable).where(eq(leadsTable.userId, uid)),
    db.select().from(tasksTable).where(eq(tasksTable.userId, uid)),
    db
      .select()
      .from(activitiesTable)
      .where(eq(activitiesTable.userId, uid))
      .orderBy(desc(activitiesTable.createdAt))
      .limit(8),
  ]);

  const totalLeads = allLeads.length;
  const totalRevenue = allLeads
    .filter((lead) => lead.stage === "won")
    .reduce((sum, lead) => sum + lead.value, 0);
  const activeDeals = allLeads.filter((lead) => !["won", "lost"].includes(lead.stage)).length;
  const pipelineValue = allLeads
    .filter((lead) => !["won", "lost"].includes(lead.stage))
    .reduce((sum, lead) => sum + lead.value, 0);
  const wonDeals = allLeads.filter((lead) => lead.stage === "won").length;
  const conversionRate = totalLeads > 0 ? Math.round((wonDeals / totalLeads) * 100) : 0;
  const openTasks = allTasks.filter((task) => task.status !== "done").length;

  const stageBreakdown = [
    "new",
    "contacted",
    "qualified",
    "negotiation",
    "proposal",
    "won",
  ].map((stage) => ({
    stage,
    count: allLeads.filter((lead) => lead.stage === stage).length,
    value: allLeads
      .filter((lead) => lead.stage === stage)
      .reduce((sum, lead) => sum + lead.value, 0),
  }));

  res.json({
    kpis: {
      totalLeads,
      totalRevenue,
      activeDeals,
      pipelineValue,
      conversionRate,
      openTasks,
      wonDeals,
    },
    stageBreakdown,
    recentActivities,
  });
});

export default router;
