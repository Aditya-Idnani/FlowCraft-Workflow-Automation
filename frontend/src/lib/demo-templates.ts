import { Node, Edge } from "@xyflow/react";

export const ecommerceNodes: Node[] = [
  { id: "1", type: "trigger.webhook", position: { x: 250, y: 150 }, data: { label: "New Order (Webhook)" } },
  { id: "2", type: "action.condition", position: { x: 500, y: 150 }, data: { label: "Check Value > $500" } },
  { id: "3", type: "action.slack", position: { x: 750, y: 50 }, data: { label: "Notify Sales Team" } },
  { id: "4", type: "action.db", position: { x: 750, y: 250 }, data: { label: "Update Inventory" } },
  { id: "5", type: "action.email", position: { x: 1000, y: 250 }, data: { label: "Send Receipt" } },
];
export const ecommerceEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3", label: "Yes" },
  { id: "e2-4", source: "2", target: "4", label: "No" },
  { id: "e3-5", source: "3", target: "5" },
  { id: "e4-5", source: "4", target: "5" },
];

export const onboardingNodes: Node[] = [
  { id: "1", type: "trigger.form", position: { x: 250, y: 200 }, data: { label: "HR Form Submitted" } },
  { id: "2", type: "action.email", position: { x: 500, y: 200 }, data: { label: "Send Welcome Email" } },
  { id: "3", type: "action.slack", position: { x: 750, y: 100 }, data: { label: "Add to Slack" } },
  { id: "4", type: "action.http", position: { x: 750, y: 300 }, data: { label: "Create GSuite Account" } },
];
export const onboardingEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e2-4", source: "2", target: "4" },
];

export const leadEnrichmentNodes: Node[] = [
  { id: "1", type: "trigger.db", position: { x: 250, y: 150 }, data: { label: "New Lead Created" } },
  { id: "2", type: "action.http", position: { x: 500, y: 150 }, data: { label: "Clearbit Enrichment" } },
  { id: "3", type: "action.condition", position: { x: 750, y: 150 }, data: { label: "Score > 80?" } },
  { id: "4", type: "action.slack", position: { x: 1000, y: 50 }, data: { label: "High Priority Alert" } },
  { id: "5", type: "action.email", position: { x: 1000, y: 250 }, data: { label: "Nurture Campaign" } },
];
export const leadEnrichmentEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4", label: "Yes" },
  { id: "e3-5", source: "3", target: "5", label: "No" },
];

export const DEMO_TEMPLATES = [
  {
    id: "ecommerce",
    name: "E-Commerce Order Fulfillment",
    description: "Automatically process Shopify orders, update inventory, and notify sales team for high-value purchases.",
    icon: "ShoppingBag",
    color: "var(--accent-amber)",
    bg: "from-[var(--accent-amber)] to-orange-500",
    nodes: ecommerceNodes,
    edges: ecommerceEdges,
  },
  {
    id: "onboarding",
    name: "Employee Onboarding",
    description: "Streamline HR processes by auto-provisioning GSuite accounts, sending welcome emails, and adding to Slack.",
    icon: "Users",
    color: "var(--accent-blue)",
    bg: "from-[var(--accent-blue)] to-cyan-500",
    nodes: onboardingNodes,
    edges: onboardingEdges,
  },
  {
    id: "lead-enrichment",
    name: "Lead Enrichment Pipeline",
    description: "Enrich new CRM leads using Clearbit, score them, and route high-priority leads directly to Slack channels.",
    icon: "Zap",
    color: "var(--accent-purple)",
    bg: "from-[var(--accent-purple)] to-fuchsia-500",
    nodes: leadEnrichmentNodes,
    edges: leadEnrichmentEdges,
  }
];
