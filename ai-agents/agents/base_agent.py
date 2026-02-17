from guardrails.pre_tx_guard import pre_tx_guard
from guardrails.runtime_guard import runtime_guard
from guardrails.post_tx_guard import post_tx_guard
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import box
import asyncio

console = Console()

class BaseAgent:

    def __init__(self, name: str, address: str, trust_score: int = 100):
        self.name         = name
        self.address      = address
        self.trust_score  = trust_score
        self.tx_history   = []

    async def send_transaction(
        self,
        target_address: str,
        value_eth: float,
        function_sig: str | None = None,
        intent: str | None = None,
        protocol: str | None = None
    ) -> dict:

        console.print(f"\n[bold cyan]🤖 Agent [{self.name}] initiating transaction...[/bold cyan]")
        self._print_tx_details(target_address, value_eth, intent, protocol)

        # ════════════════════════════════════════
        # LAYER 1 — Pre-Transaction Guard (local)
        # ════════════════════════════════════════
        console.print("\n[bold yellow]🔍 LAYER 1: Pre-Transaction Check...[/bold yellow]")
        pre_result = pre_tx_guard.check(
            agent_address=self.address,
            target_address=target_address,
            value_eth=value_eth,
            function_sig=function_sig,
            intent=intent,
            protocol=protocol
        )

        for flag in pre_result.flags:
            console.print(f"  {flag}")
        for warn in pre_result.warnings:
            console.print(f"  {warn}")
        console.print(f"  📋 Recommendation: [bold]{pre_result.recommendation}[/bold]")

        if not pre_result.passed:
            console.print(Panel(
                f"[bold red]❌ BLOCKED at Layer 1[/bold red]\n{chr(10).join(pre_result.flags)}",
                title="PRE-TX GUARD — BLOCKED", border_style="red"
            ))
            return self._record_tx(target_address, value_eth, intent, "BLOCKED", "Pre-TX guard failed", pre_result.risk_level)

        # ════════════════════════════════════════
        # LAYER 2 — Runtime Guard (backend + AI)
        # ════════════════════════════════════════
        console.print("\n[bold yellow]🔍 LAYER 2: Runtime Validation (AI + Risk Engine)...[/bold yellow]")
        runtime_result = await runtime_guard.validate(
            agent_address=self.address,
            target_address=target_address,
            value_eth=value_eth,
            function_sig=function_sig,
            intent=intent,
            protocol=protocol
        )

        console.print(f"  🎯 Risk Score: [bold]{runtime_result.risk_score}/100[/bold]  |  Risk Level: [bold]{runtime_result.risk_level}[/bold]")
        console.print(f"  🤖 AI: {runtime_result.ai_explanation}")

        if runtime_result.checks_passed:
            console.print(f"  ✅ Passed: {', '.join(runtime_result.checks_passed[:2])}")
        if runtime_result.checks_failed:
            console.print(f"  ❌ Failed: {', '.join(runtime_result.checks_failed[:2])}")

        if not runtime_result.passed:
            console.print(Panel(
                f"[bold red]❌ BLOCKED at Layer 2[/bold red]\n{runtime_result.block_reason}\n\n[italic]{runtime_result.ai_explanation}[/italic]",
                title="RUNTIME GUARD — BLOCKED", border_style="red"
            ))
            return self._record_tx(target_address, value_eth, intent, "BLOCKED", runtime_result.block_reason, runtime_result.risk_level)

        if runtime_result.decision == "PENDING":
            console.print(Panel(
                f"[bold yellow]⏳ PENDING MANUAL APPROVAL[/bold yellow]\n{runtime_result.block_reason}",
                title="RUNTIME GUARD — PENDING", border_style="yellow"
            ))
            return self._record_tx(target_address, value_eth, intent, "PENDING", runtime_result.block_reason, runtime_result.risk_level)

        # ════════════════════════════════════════
        # LAYER 3 — Post-Transaction Analysis
        # ════════════════════════════════════════
        console.print("\n[bold yellow]🔍 LAYER 3: Post-Transaction Analysis...[/bold yellow]")
        post_result = post_tx_guard.analyze(
            intent=intent,
            target_address=target_address,
            value_eth=value_eth,
            decision=runtime_result.decision,
            ai_explanation=runtime_result.ai_explanation,
            current_trust_score=self.trust_score
        )

        # Update agent trust score
        old_score = self.trust_score
        self.trust_score = post_result.new_trust_score
        adj = post_result.trust_score_adjustment
        adj_str = f"+{adj}" if adj >= 0 else str(adj)
        console.print(f"  📊 Trust Score: {old_score} → {self.trust_score} ({adj_str})")
        console.print(f"  💡 Lesson: {post_result.lesson_learned}")

        console.print(Panel(
            f"[bold green]✅ TRANSACTION APPROVED[/bold green]\n"
            f"TX ID: {runtime_result.tx_id}\n"
            f"Risk: {runtime_result.risk_level} ({runtime_result.risk_score}/100)\n"
            f"AI: {runtime_result.ai_explanation}",
            title="ALL LAYERS PASSED", border_style="green"
        ))

        return self._record_tx(target_address, value_eth, intent, "APPROVED", None, runtime_result.risk_level, runtime_result.tx_id)

    def _record_tx(self, target, value, intent, decision, reason, risk, tx_id=None):
        record = {
            "target": target, "value_eth": value,
            "intent": intent, "decision": decision,
            "reason": reason, "risk": risk, "tx_id": tx_id
        }
        self.tx_history.append(record)
        return record

    def _print_tx_details(self, target, value, intent, protocol):
        table = Table(box=box.SIMPLE, show_header=False)
        table.add_column("Field", style="bold cyan", width=12)
        table.add_column("Value")
        table.add_row("Agent",    f"{self.name} ({self.address[:10]}...)")
        table.add_row("Target",   f"{target[:16]}...")
        table.add_row("Value",    f"{value} ETH")
        table.add_row("Protocol", protocol or "N/A")
        table.add_row("Intent",   (intent or "N/A")[:60])
        console.print(table)