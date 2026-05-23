import { Router } from "express";
import { db } from "@workspace/db";
import { activitiesTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);

router.get("/activities", async (req, res) => {
  const uid = req.session.userId!;
  const limit = parseInt(req.query.limit as string) || 20;
  const activities = await db
    .select()
    .from(activitiesTable)
    .where(eq(activitiesTable.userId, uid))
    .orderBy(desc(activitiesTable.createdAt))
    .limit(limit);
  res.json(activities);
});

router.post("/activities", async (req, res) => {
  const uid = req.session.userId!;
  const {
    type,
    title,
    description,
    leadId,
    leadName,
    userName,
    userInitials,
    userColor,
  } = req.body;
  const [activity] = await db
    .insert(activitiesTable)
    .values({
      userId: uid,
      type,
      title,
      description: description || "",
      leadId: leadId || null,
      leadName: leadName || "",
      userName: userName || req.session.userName || "",
      userInitials: userInitials || req.session.userInitials || "",
      userColor: userColor || "#3b5bdb",
    })
    .returning();
  res.status(201).json(activity);
});

export default router;
