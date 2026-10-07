import { test, expect, jest, afterEach } from '@jest/globals';
import * as Linking from 'expo-linking';
import { redirectSystemPath } from '../../src/app/+native-intent';
import { subscribe } from 'expo-router/build/link/linking';
import { getLinkingConfig } from 'expo-router/build/getLinkingConfig';
import { getMockContext } from 'expo-router/build/testing-library/mock-config';
import { getRoutes } from 'expo-router/build/getRoutes';
afterEach(() => { jest.restoreAllMocks(); });

test('允许的固定路由与安全整数ID兼容scheme和Expo Go入口', () => {
  for (const [path, expected] of [['fitquest://history', '/history'], ['/workout/active', '/workout/active'],
    ['fitquest:///workout/complete/12', '/workout/complete/12'], ['exp://127.0.0.1:8081/--/history/3', '/history/3'],
    ['fitquest://', '/history']]) {
    expect(redirectSystemPath({ path, initial: true })).toBe(expected);
  }
});
test('畸形、编码、过长、查询与非产品链接在解码前拒绝，热启动不打断当前训练', () => {
  for (const path of ['/history?x=' + '%C2'.repeat(5000), '/history/%FE', '/history/0',
    '/history/9007199254740992', '/history/1.2', '/history/01', '/workout/active#anything',
    'https://untrusted.example/history', '/%68istory', '/history?name=深蹲', 'x'.repeat(1025)]) {
    expect(redirectSystemPath({ path, initial: true })).toBe('/history');
    expect(redirectSystemPath({ path, initial: false })).toBeNull();
  }
});
test('实际Router冷启动链接在生成导航状态前经过防护', async () => {
  const context = getMockContext({ history: () => null, '+native-intent': { redirectSystemPath } });
  const routes = getRoutes(context)!;
  const config = getLinkingConfig(routes, context, () => ({ segments: [] }) as never,
    { serverUrl: 'fitquest://history?x=' + '%C2'.repeat(5000), skipGenerated: true, sitemap: false, notFound: false });
  expect(await config.getInitialURL?.()).toBe('/history');
});
test('实际Router订阅只传递清洁路径，恶意热启动不进入查询解析器', async () => {
  let receive!: (event: { url: string }) => unknown;
  const subscription = Linking.addEventListener('url', () => {});
  const remove = jest.spyOn(subscription, 'remove');
  jest.spyOn(Linking, 'addEventListener').mockImplementation((_type, callback) => { receive = callback; return subscription; });
  const listener = jest.fn();
  const unsubscribe = subscribe({ redirectSystemPath }, [])(listener);
  await receive({ url: 'fitquest://history?x=' + '%C2'.repeat(5000) });
  expect(listener).not.toHaveBeenCalled();
  await receive({ url: 'fitquest://history/5' });
  expect(listener).toHaveBeenCalledWith('/history/5');
  unsubscribe();
  expect(remove).toHaveBeenCalled();
});
