import { render } from "ink";
import React from "react";
import { PortDashboardApp } from "../../tui/app";

export async function runDashboardCommand() {
  render(<PortDashboardApp />);
}