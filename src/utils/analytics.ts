/**
 * Google Analytics Event Tracking Utilities
 */

// GTMのdataLayerが利用可能かチェック
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * GTM dataLayerにイベントをプッシュ
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...parameters
    });
  }
}

/**
 * Google Analytics 4 (GA4) イベント
 */
export function trackGA4Event(
  eventName: string,
  parameters?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}

/**
 * 圧縮イベントをトラッキング
 */
export function trackCompression(
  originalSize: number,
  compressedSize: number,
  compressionRatio: number
) {
  trackEvent('geojson_compression', {
    original_size: originalSize,
    compressed_size: compressedSize,
    compression_ratio: compressionRatio,
    size_reduction: 100 - compressionRatio
  });
}

/**
 * ファイルアップロードをトラッキング
 */
export function trackFileUpload(fileSize: number, uploadMethod: 'drag' | 'browse' | 'paste') {
  trackEvent('file_upload', {
    file_size: fileSize,
    upload_method: uploadMethod
  });
}

/**
 * ダウンロードをトラッキング
 */
export function trackDownload(compressedSize: number) {
  trackEvent('file_download', {
    file_size: compressedSize,
    file_type: 'geojson'
  });
}

/**
 * エラーをトラッキング
 */
export function trackError(errorType: string, errorMessage: string) {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage
  });
}

/**
 * ページビューをトラッキング（SPA用）
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title
  });
}