import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable, activitiesTable } from "@workspace/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);

router.get("/leads", async (req, res) => {
  const uid = req.session.userId!;
  const leads = await db
    .select()
    .from(leadsTable)
    .where(eq(leadsTable.userId, uid))
    .orderBy(desc(leadsTable.createdAt));
  res.json(leads);
});

router.get("/leads/:id", async (req, res) => {
  const uid = req.session.userId!;
  const id = parseInt(req.params.id);
  const [lead] = await db
    .select()
    .from(leadsTable)
    .where(and(eq(leadsTable.id, id), eq(leadsTable.userId, uid)));
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  res.json(lead);
});

router.post("/leads", async (req, res) => {
  const uid = req.session.userId!;
  const {
    name,
    email,
    company,
    phone,
    stage,
    priority,
    value,
    source,
    assignedToName,
    assignedToInitials,
    assignedToColor,
    notes,
    dueDate,
  } = req.body;
  const [lead] = await db
    .insert(leadsTable)
    .values({
      userId: uid,
      name,
      email: email || "",
      company,
      phone: phone || "",
      stage: stage || "new",
      priority: priority || "medium",
      value: value || 0,
      source: source || "",
      assignedToName: assignedToName || req.session.userName || "",
      assignedToInitials: assignedToInitials || req.session.userInitials || "",
      assignedToColor: assignedToColor || "#3b5bdb",
      notes: notes || "",
      dueDate: dueDate || "",
    })
    .returning();
  await db.insert(activitiesTable).values({
    userId: uid,
    type: "lead_created",
    title: `New lead: ${name}`,
    description: `${company} was added to the pipeline`,
    leadId: lead.id,
    leadName: name,
    userName: req.session.userName || "",
    userInitials: req.session.userInitials || "",
    userColor: "#3b5bdb",
  });
  res.status(201).json(lead);
});

router.put("/leads/:id", async (req, res) => {
  const uid = req.session.userId!;
  const id = parseInt(req.params.id);
  const [existing] = await db
    .select()
    .from(leadsTable)
    .where(and(eq(leadsTable.id, id), eq(leadsTable.userId, uid)));
  if (!existing) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  const {
    name,
    email,
    company,
    phone,
    stage,
    priority,
    value,
    source,
    assignedToName,
    assignedToInitials,
    assignedToColor,
    notes,
    dueDate,
  } = req.body;
  const [lead] = await db
    .update(leadsTable)
    .set({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(company !== undefined && { company }),
      ...(phone !== undefined && { phone }),
      ...(stage !== undefined && { stage }),
      ...(priority !== undefined && { priority }),
      ...(value !== undefined && { value }),
      ...(source !== undefined && { source }),
      ...(assignedToName !== undefined && { assignedToName }),
      ...(assignedToInitials !== undefined && { assignedToInitials }),
      ...(assignedToColor !== undefined && { assignedToColor }),
      ...(notes !== undefined && { notes }),
      ...(dueDate !== undefined && { dueDate }),
      updatedAt: new Date(),
    })
    .where(and(eq(leadsTable.id, id), eq(leadsTable.userId, uid)))
    .returning();
  if (stage && stage !== existing.stage) {
    await db.insert(activitiesTable).values({
      userId: uid,
      type: "deal_updated",
      title: `Stage updated: ${existing.stage} -> ${stage}`,
      description: `${lead.company} moved from ${existing.stage} to ${stage}`,
      leadId: id,
      leadName: lead.name,
      userName: req.session.userName || "",
      userInitials: req.session.userInitials || "",
      userColor: "#3b5bdb",
    });
  }
  res.json(lead);
});

router.delete("/leads/:id", async (req, res) => {
  const uid = req.session.userId!;
  const id = parseInt(req.params.id);
  await db
    .delete(leadsTable)
    .where(and(eq(leadsTable.id, id), eq(leadsTable.userId, uid)));
  res.status(204).send();
});

export default router;
