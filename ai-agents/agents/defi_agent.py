from agents.base_agent import BaseAgent
from rich.console import Console

console = Console()

class DeFiAgent(BaseAgent):
    """
    A legitimate DeFi trading agent.
    Performs swaps, liquidity provision, and yield farming.
    """

    def __init__(self):
        super().__init__(
            name="DeFi-Agent-01",
            address="0xDeFiAgent0000000000000000000000000001",
            trust_score=100
        )

    async def swap_eth_for_usdc(self, amount_eth: float):
        """Legitimate: Swap ETH for USDC on Uniswap"""
        console.print("\n[bold blue]💱 DeFiAgent: Initiating ETH → USDC swap[/bold blue]")
        return await self.send_transaction(
            target_address="0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
            value_eth=amount_eth,
            function_sig="0x7ff36ab5",   # swapExactETHForTokens
            intent=f"Swap {amount_eth} ETH for USDC on Uniswap V2",
            protocol="Uniswap"
        )

    async def supply_to_aave(self, amount_eth: float):
        """Legitimate: Supply ETH to Aave for yield"""
        console.print("\n[bold blue]🏦 DeFiAgent: Supplying ETH to Aave[/bold blue]")
        return await self.send_transaction(
            target_address="0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2",
            value_eth=amount_eth,
            function_sig="0x617ba037",   # supply
            intent=f"Supply {amount_eth} ETH to Aave V3 for yield",
            protocol="Aave"
        )

    async def risky_large_transfer(self, amount_eth: float):
        """Borderline: Large ETH transfer — will trigger warnings"""
        console.print("\n[bold blue]💸 DeFiAgent: Large transfer attempt[/bold blue]")
        return await self.send_transaction(
            target_address="0xRecipient0000000000000000000000000001",
            value_eth=amount_eth,
            intent=f"Transfer {amount_eth} ETH to treasury wallet",
            protocol=None
        )