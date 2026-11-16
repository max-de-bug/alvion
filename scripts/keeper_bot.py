import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8080"
MAINTENANCE_MARGIN_BPS = 80  # 0.8%

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}", headers={"User-Agent": "AlvionKeeper/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            return json.loads(res.read().decode())
    except Exception as e:
        return {"success": False, "error": str(e)}

def post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "AlvionKeeper/1.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            return json.loads(res.read().decode())
    except Exception as e:
        return {"success": False, "error": str(e)}

class AlvionLiquidationKeeper:
    def __init__(self, keeper_address="0xKeeperBotAutonomousAvalanche"):
        self.keeper_address = keeper_address
        self.total_liquidations_executed = 0
        self.total_bounties_earned_usdc = 0.0

    def scan_and_liquidate(self):
        print(f"[*] Autonomous Keeper scanning for undercollateralized positions...")

        # 1. Fetch live oracle prices for markets
        oracle_prices = {}
        for m in ["SPY", "NVDA", "TSLA", "AAPL", "AVAX"]:
            f = get(f"/api/funding/{m}")
            if f.get("success"):
                oracle_prices[m] = f.get("funding", {}).get("oracle_price", 0)

        # 2. Check test position health
        # In a test simulation, simulate a margin stress test on a position
        print(f"[*] Monitored Mark Prices: {oracle_prices}")

        test_payload = {
            "position_id": "POS-SIM-UNDERCOLLATERALIZED",
            "current_price": oracle_prices.get("AVAX", 7.28) * 0.50 # 50% price crash
        }
        res = post("/api/liquidate", test_payload)
        print(f"[*] Liquidation Assessment: {res}")
        return res

if __name__ == "__main__":
    keeper = AlvionLiquidationKeeper()
    keeper.scan_and_liquidate()
