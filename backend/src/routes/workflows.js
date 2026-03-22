import express from "express";

const router = express.Router();

// In-memory storage
const workflows = [];
const executions = [];

/*
GET all workflows
*/
router.get("/", (req, res) => {
  res.json(workflows);
});

/*
CREATE workflow
*/
router.post("/", (req, res) => {
  const { name } = req.body;

  const workflow = {
    id: Date.now().toString(),
    name,
    steps: [],
  };

  workflows.push(workflow);

  res.json(workflow);
});

/*
GET workflow by id
*/
router.get("/:id", (req, res) => {
  const workflow = workflows.find((w) => w.id === req.params.id);

  if (!workflow) {
    return res.status(404).json({
      error: "Workflow not found",
    });
  }

  res.json(workflow);
});

/*
ADD step to workflow
*/
router.post("/:id/steps", (req, res) => {
  const workflow = workflows.find((w) => w.id === req.params.id);

  if (!workflow) {
    return res.status(404).json({
      error: "Workflow not found",
    });
  }

  const step = {
    id: Date.now().toString(),
    name: req.body.name,
  };

  workflow.steps.push(step);

  res.json(step);
});

/*
EXECUTE workflow
*/
router.post("/:id/execute", async (req, res) => {
  const workflow = workflows.find((w) => w.id === req.params.id);

  if (!workflow) {
    return res.status(404).json({
      error: "Workflow not found",
    });
  }

  const execution = {
    id: Date.now().toString(),
    workflowId: workflow.id,
    workflowName: workflow.name,
    status: "running",
    startedAt: new Date(),
    logs: [],
  };

  executions.push(execution);

  try {
    for (const step of workflow.steps) {
      execution.logs.push(`Executing step: ${step.name}`);
      console.log(`Executing step: ${step.name}`);

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    execution.status = "success";
    execution.finishedAt = new Date();

    console.log("Workflow execution finished");

    res.json({
      message: "Workflow executed successfully",
      executionId: execution.id,
    });

  } catch (err) {
    execution.status = "failed";
    execution.finishedAt = new Date();

    res.status(500).json({
      error: "Execution failed",
    });
  }
});

export default router;