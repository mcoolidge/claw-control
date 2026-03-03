import { AGENTS, checkAgentHealth, AgentStatus } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getAgentStatuses(): Promise<AgentStatus[]> {
  return Promise.all(
    AGENTS.map(async (agent) => ({
      ...agent,
      status: (await checkAgentHealth(agent.port)) ? "up" : "down",
      lastChecked: new Date().toLocaleTimeString(),
    }))
  );
}

export default async function Home() {
  const agents = await getAgentStatuses();

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Claw Control</h1>
      <p className="text-muted-foreground mb-8">OpenClaw agent dashboard</p>

      <h2 className="text-lg font-semibold mb-4">Agent Status</h2>
      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent) => (
          <Card key={agent.name}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                {agent.name}
                <Badge variant={agent.status === "up" ? "default" : "destructive"}>
                  {agent.status === "up" ? "● UP" : "● DOWN"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <div>Port: {agent.port}</div>
              <div>Model: {agent.model}</div>
              <div>Checked: {agent.lastChecked}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
