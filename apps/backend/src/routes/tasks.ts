import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable } from "@workspace/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);

router.get("/tasks", async (req, res) => {
  const uid = req.session.userId!;
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.userId, uid))
    .orderBy(desc(tasksTable.createdAt));
  res.json(tasks);
});

router.post("/tasks", async (req, res) => {
  const uid = req.session.userId!;
  const {
    title,
    description,
    status,
    priority,
    dueDate,
    assignedToName,
    assignedToInitials,
    leadId,
    leadName,
  } = req.body;
  const [task] = await db
    .insert(tasksTable)
    .values({
      userId: uid,
      title,
      description: description || "",
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || "",
      assignedToName: assignedToName || req.session.userName || "",
      assignedToInitials: assignedToInitials || req.session.userInitials || "",
      leadId: leadId || null,
      leadName: leadName || "",
    })
    .returning();
  res.status(201).json(task);
});

router.put("/tasks/:id", async (req, res) => {
  const uid = req.session.userId!;
  const id = parseInt(req.params.id);
  const {
    title,
    description,
    status,
    priority,
    dueDate,
    assignedToName,
    assignedToInitials,
    leadId,
    leadName,
  } = req.body;
  const [task] = await db
    .update(tasksTable)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate }),
      ...(assignedToName !== undefined && { assignedToName }),
      ...(assignedToInitials !== undefined && { assignedToInitials }),
      ...(leadId !== undefined && { leadId }),
      ...(leadName !== undefined && { leadName }),
    })
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, uid)))
    .returning();
  res.json(task);
});

router.delete("/tasks/:id", async (req, res) => {
  const uid = req.session.userId!;
  const id = parseInt(req.params.id);
  await db
    .delete(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, uid)));
  res.status(204).send();
});

export default router;
