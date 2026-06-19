import {
  CreateLevelRequest,
  DeleteLevelRequest,
  GetLevelRequest,
  GetLevelsRequest,
  GetMonitoringDataRequest,
  GetTradingStatusRequest,
  LevelConfig,
  SetTradingEnabledRequest,
  StreamMonitoringDataRequest,
  Symbol,
  ToggleLevelRequest,
  ToggleStrategyRequest,
  UpdateLevelRequest,
  type Level,
  type MonitoringData,
} from "@/gen/trading_cli_pb";
import { getTradingClient, rpcOptions, resetTradingClient } from "@/api/client";
import { wrapFixed } from "@/api/transforms";
import type { CreateLevelFormValues } from "@/lib/validation";

export async function connectAndFetchInitial(): Promise<{
  tradingEnabled: boolean;
  monitoringData: MonitoringData | undefined;
}> {
  const client = getTradingClient();
  const [statusRes, monitoringRes] = await Promise.all([
    client.getTradingStatus(new GetTradingStatusRequest(), rpcOptions.default),
    client.getMonitoringData(new GetMonitoringDataRequest(), rpcOptions.default),
  ]);
  return {
    tradingEnabled: statusRes.enabled,
    monitoringData: monitoringRes.data,
  };
}

export async function getTradingStatus(): Promise<boolean> {
  const client = getTradingClient();
  const res = await client.getTradingStatus(
    new GetTradingStatusRequest(),
    rpcOptions.default,
  );
  return res.enabled;
}

export async function setTradingEnabled(enabled: boolean) {
  const client = getTradingClient();
  return client.setTradingEnabled(
    new SetTradingEnabledRequest({ enabled }),
    rpcOptions.toggle,
  );
}

export async function getMonitoringData(): Promise<MonitoringData | undefined> {
  const client = getTradingClient();
  const res = await client.getMonitoringData(
    new GetMonitoringDataRequest(),
    rpcOptions.default,
  );
  return res.data;
}

export async function getLevels(): Promise<Level[]> {
  const client = getTradingClient();
  const res = await client.getLevels(new GetLevelsRequest(), rpcOptions.default);
  return res.levels;
}

export async function getLevel(levelId: string): Promise<Level | undefined> {
  const client = getTradingClient();
  const res = await client.getLevel(
    new GetLevelRequest({ levelId }),
    rpcOptions.default,
  );
  return res.level;
}

export async function toggleLevel(levelId: string, enabled: boolean) {
  const client = getTradingClient();
  return client.toggleLevel(
    new ToggleLevelRequest({ levelId, enabled }),
    rpcOptions.toggle,
  );
}

export async function toggleStrategy(
  strategyName: string,
  symbol: string,
  enabled: boolean,
) {
  const client = getTradingClient();
  return client.toggleStrategy(
    new ToggleStrategyRequest({ strategyName, symbol, enabled }),
    rpcOptions.toggle,
  );
}

export async function createLevel(values: CreateLevelFormValues) {
  const config = new LevelConfig({
    id: values.levelId.trim(),
    symbol: new Symbol({
      base: values.symbolBase.trim(),
      quote: values.symbolQuote.trim(),
    }),
    side: values.side,
    orderType: values.orderType,
    enabled: values.enabled,
    price: wrapFixed(values.price),
    quantity: wrapFixed(values.quantity),
    riskLimit: values.riskLimit.trim() || "0",
    maxPositionSize: values.maxPosition.trim() || "0",
    repostOnFill: values.repostOnFill,
    repostOnCancel: values.repostOnCancel,
  });
  const client = getTradingClient();
  return client.createLevel(new CreateLevelRequest({ config }), rpcOptions.default);
}

export interface EditLevelValues {
  enabled: boolean;
  price: string;
  quantity: string;
  riskLimit: string;
  maxPosition: string;
  repostOnFill: boolean;
  repostOnCancel: boolean;
}

export async function updateLevel(levelId: string, values: EditLevelValues) {
  const config = new LevelConfig({
    enabled: values.enabled,
    riskLimit: values.riskLimit.trim() || undefined,
    maxPositionSize: values.maxPosition.trim() || undefined,
    repostOnFill: values.repostOnFill,
    repostOnCancel: values.repostOnCancel,
    side: "",
    orderType: "",
    ...(values.price.trim() ? { price: wrapFixed(values.price) } : {}),
    ...(values.quantity.trim() ? { quantity: wrapFixed(values.quantity) } : {}),
  });

  const client = getTradingClient();
  return client.updateLevel(
    new UpdateLevelRequest({ levelId, config }),
    rpcOptions.default,
  );
}

export async function deleteLevel(levelId: string) {
  const client = getTradingClient();
  return client.deleteLevel(
    new DeleteLevelRequest({ levelId }),
    rpcOptions.default,
  );
}

export function streamMonitoringData(signal: AbortSignal) {
  const client = getTradingClient();
  return client.streamMonitoringData(new StreamMonitoringDataRequest(), { signal });
}

export { resetTradingClient };
