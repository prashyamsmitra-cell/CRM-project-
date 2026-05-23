import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);

router.get("/analytics", async (req, res) => {
  const uid = req.session.userId!;
  const allLeads = await db.select().from(leadsTable).where(eq(leadsTable.userId, uid));

  const monthlyRevenue = [
    { month: "Jan", revenue: 0, deals: 0 },
    { month: "Feb", revenue: 0, deals: 0 },
    { month: "Mar", revenue: 0, deals: 0 },
    { month: "Apr", revenue: 0, deals: 0 },
    { month: "May", revenue: 0, deals: 0 },
    { month: "Jun", revenue: 0, deals: 0 },
    { month: "Jul", revenue: 0, deals: 0 },
    { month: "Aug", revenue: 0, deals: 0 },
    { month: "Sep", revenue: 0, deals: 0 },
    { month: "Oct", revenue: 0, deals: 0 },
    { month: "Nov", revenue: 0, deals: 0 },
    { month: "Dec", revenue: 0, deals: 0 },
  ];

  allLeads
    .filter((lead) => lead.stage === "won")
    .forEach((lead) => {
      const monthIndex = new Date(lead.createdAt).getMonth();
      monthlyRevenue[monthIndex].revenue += lead.value;
      monthlyRevenue[monthIndex].deals += 1;
    });

  const stages = ["new", "contacted", "qualified", "negotiation", "proposal", "won"];
  const funnel = stages.map((stage) => ({
    stage: stage.charAt(0).toUpperCase() + stage.slice(1),
    count: allLeads.filter((lead) => lead.stage === stage).length,
    value: allLeads
      .filter((lead) => lead.stage === stage)
      .reduce((sum, lead) => sum + lead.value, 0),
  }));

  const sourceMap: Record<string, number> = {};
  allLeads.forEach((lead) => {
    if (lead.source) {
      sourceMap[lead.source] = (sourceMap[lead.source] || 0) + 1;
    }
  });

  const total = allLeads.length;
  const sourceBreakdown = Object.entries(sourceMap).map(([source, count]) => ({
    source,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  const priorities = ["high", "medium", "low"];
  const priorityBreakdown = priorities.map((priority) => ({
    priority,
    count: allLeads.filter((lead) => lead.priority === priority).length,
    value: allLeads
      .filter((lead) => lead.priority === priority)
      .reduce((sum, lead) => sum + lead.value, 0),
  }));

  const totalRevenue = allLeads
    .filter((lead) => lead.stage === "won")
    .reduce((sum, lead) => sum + lead.value, 0);
  const avgDealSize =
    allLeads.length > 0
      ? Math.round(allLeads.reduce((sum, lead) => sum + lead.value, 0) / allLeads.length)
      : 0;
  const winRate =
    allLeads.length > 0
      ? Math.round((allLeads.filter((lead) => lead.stage === "won").length / allLeads.length) * 100)
      : 0;

  res.json({
    monthlyRevenue,
    funnel,
    sourceBreakdown,
    priorityBreakdown,
    summary: {
      totalRevenue,
      avgDealSize,
      winRate,
      totalLeads: allLeads.length,
    },
  });
});

export default router;
