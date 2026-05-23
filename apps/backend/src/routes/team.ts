import { Router } from "express";
import { db } from "@workspace/db";
import { teamMembersTable } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);

router.get("/team", async (req, res) => {
  const uid = req.session.userId!;
  const members = await db.select().from(teamMembersTable).where(eq(teamMembersTable.userId, uid));
  res.json(members);
});

router.post("/team", async (req, res) => {
  const uid = req.session.userId!;
  const {
    name,
    email,
    role,
    department,
    initials,
    avatarColor,
    status,
    dealsWon,
    revenue,
    leadsAssigned,
  } = req.body;
  const [member] = await db
    .insert(teamMembersTable)
    .values({
      userId: uid,
      name,
      email,
      role,
      department: department || "",
      initials,
      avatarColor: avatarColor || "#3b5bdb",
      status: status || "active",
      dealsWon: dealsWon || 0,
      revenue: revenue || 0,
      leadsAssigned: leadsAssigned || 0,
    })
    .returning();
  res.status(201).json(member);
});

router.put("/team/:id", async (req, res) => {
  const uid = req.session.userId!;
  const id = parseInt(req.params.id);
  const {
    name,
    email,
    role,
    department,
    initials,
    avatarColor,
    status,
    dealsWon,
    revenue,
    leadsAssigned,
  } = req.body;
  const [member] = await db
    .update(teamMembersTable)
    .set({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(department !== undefined && { department }),
      ...(initials !== undefined && { initials }),
      ...(avatarColor !== undefined && { avatarColor }),
      ...(status !== undefined && { status }),
      ...(dealsWon !== undefined && { dealsWon }),
      ...(revenue !== undefined && { revenue }),
      ...(leadsAssigned !== undefined && { leadsAssigned }),
    })
    .where(and(eq(teamMembersTable.id, id), eq(teamMembersTable.userId, uid)))
    .returning();
  res.json(member);
});

router.delete("/team/:id", async (req, res) => {
  const uid = req.session.userId!;
  const id = parseInt(req.params.id);
  await db
    .delete(teamMembersTable)
    .where(and(eq(teamMembersTable.id, id), eq(teamMembersTable.userId, uid)));
  res.status(204).send();
});

export default router;
