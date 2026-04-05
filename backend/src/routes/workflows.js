import express from "express";

const router = express.Router();

// In-memory storage
const workflows = [];
const executions = [];

// Helper: find workflow by ID
function findWorkflow(id) {
  return workflows.find((w) => w.id === id);
}

// GET /workflows - List all workflows
router.get("/", (req, res) => {
  res.json(workflows);
});

// POST /workflows - Create new workflow
router.post("/", (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Workflow name is required" });
  }

  const workflow = {
    id: Date.now().toString(),
    name: name.trim(),
    steps: [],
    createdAt: new Date().toISOString(),
  };

  workflows.push(workflow);
  res.status(201).json(workflow);
});

// GET /workflows/executions - List all executions
router.get("/executions", (req, res) => {
  res.json(executions);
});

// GET /workflows/:id - Get single workflow
router.get("/:id", (req, res) => {
  const workflow = findWorkflow(req.params.id);

  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  res.json(workflow);
});

// PUT /workflows/:id - Update workflow
router.put("/:id", (req, res) => {
  const workflow = findWorkflow(req.params.id);

  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  const { name } = req.body;

  if (name && typeof name === "string" && name.trim()) {
    workflow.name = name.trim();
  }

  res.json(workflow);
});

// DELETE /workflows/:id - Delete workflow
router.delete("/:id", (req, res) => {
  const index = workflows.findIndex((w) => w.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  workflows.splice(index, 1);
  res.status(204).send();
});

// POST /workflows/:id/steps - Add step to workflow
router.post("/:id/steps", (req, res) => {
  const workflow = findWorkflow(req.params.id);

  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  const { name } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Step name is required" });
  }

  const step = {
    id: Date.now().toString(),
    name: name.trim(),
  };

  workflow.steps.push(step);
  res.json(workflow);
});

// DELETE /workflows/:id/steps/:stepId - Remove step from workflow
router.delete("/:id/steps/:stepId", (req, res) => {
  const workflow = findWorkflow(req.params.id);

  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  const stepIndex = workflow.steps.findIndex((s) => s.id === req.params.stepId);

  if (stepIndex === -1) {
    return res.status(404).json({ error: "Step not found" });
  }

  workflow.steps.splice(stepIndex, 1);
  res.json(workflow);
});

// POST /workflows/:id/execute - Execute workflow
router.post("/:id/execute", async (req, res) => {
  const workflow = findWorkflow(req.params.id);

  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  const execution = {
    id: Date.now().toString(),
    workflowId: workflow.id,
    workflowName: workflow.name,
    status: "running",
    startedAt: new Date().toISOString(),
    logs: [],
  };

  executions.push(execution);

  try {
    for (const step of workflow.steps) {
      execution.logs.push(`Executing step: ${step.name}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    execution.status = "success";
    execution.finishedAt = new Date().toISOString();

    res.json({
      message: "Workflow executed successfully",
      executionId: execution.id,
      status: "success",
    });
  } catch (err) {
    execution.status = "failed";
    execution.finishedAt = new Date().toISOString();
    execution.error = err.message;

    res.status(500).json({
      error: "Execution failed",
      executionId: execution.id,
      status: "failed",
    });
  }
});

export default router;