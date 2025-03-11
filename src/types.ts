export interface Asset {
  name: string;
  type: string;
  assetPack: string;
  link: string;
}

export interface ApiIface {
  fetchAssetData: () => Promise<Asset[] | { error: string }>;
}

declare global {
  interface Window {
    api: ApiIface;
  }
}
