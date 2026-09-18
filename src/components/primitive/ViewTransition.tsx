import * as React from "react";

type ViewTransitionProps = {
  children: React.ReactNode;
  name?: string;
};

export const ViewTransition = (
  React as unknown as {
    ViewTransition: React.ComponentType<ViewTransitionProps>;
  }
).ViewTransition;
