import { Suspense } from "react";
import TaskManager from "./task-manager";

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f6f7f9]" />}>
      <TaskManager />
    </Suspense>
  );
}
