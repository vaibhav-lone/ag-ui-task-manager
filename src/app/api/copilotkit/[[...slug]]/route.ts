import {
    CopilotRuntime,
    createCopilotRuntimeHandler,
    BuiltInAgent,
} from "@copilotkit/runtime/v2";

const builtInAgent = new BuiltInAgent({
    model: "google:gemini-3.6-flash",
});

const runtime = new CopilotRuntime({
    agents: {
        default: builtInAgent,
    },
});

const handler = createCopilotRuntimeHandler({
    runtime,
});

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;