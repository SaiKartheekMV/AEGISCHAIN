import asyncio
from agents.defi_agent import DeFiAgent
from agents.malicious_agent import MaliciousAgent
from rich.console import Console
from rich.panel import Panel
from rich.rule import Rule

console = Console()

async def run_legitimate_scenarios():
    console.print(Rule("[bold green]✅ LEGITIMATE AGENT SCENARIOS[/bold green]"))
    agent = DeFiAgent()

    # Safe swap
    await agent.swap_eth_for_usdc(0.1)
    await asyncio.sleep(1)

    # Aave supply
    await agent.supply_to_aave(0.05)
    await asyncio.sleep(1)

    # Large transfer (warnings but may pass)
    await agent.risky_large_transfer(0.8)

async def run_attack_scenarios():
    console.print(Rule("[bold red]🚨 ATTACK SCENARIOS — AegisChain POC DEMO[/bold red]"))
    agent = MaliciousAgent()

    await agent.demo_prompt_injection()
    await asyncio.sleep(1)

    await agent.demo_hallucinated_address()
    await asyncio.sleep(1)

    await agent.demo_blacklisted_target()
    await asyncio.sleep(1)

    await agent.demo_drain_function()

async def main():
    console.print(Panel.fit(
        "[bold cyan]🛡️  AegisChain GuardRail System[/bold cyan]\n"
        "[white]AI Agent Transaction Security Demo[/white]",
        border_style="cyan"
    ))

    console.print("\n[bold]Select demo mode:[/bold]")
    console.print("  1. Legitimate agent scenarios")
    console.print("  2. Attack scenarios (POC demo)")
    console.print("  3. Full demo (both)")

    choice = input("\nEnter choice (1/2/3): ").strip()

    if choice == "1":
        await run_legitimate_scenarios()
    elif choice == "2":
        await run_attack_scenarios()
    else:
        await run_legitimate_scenarios()
        await run_attack_scenarios()

if __name__ == "__main__":
    asyncio.run(main())