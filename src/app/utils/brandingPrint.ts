export interface BrandingPrintConfig {
  systemName: string;
  phone: string;
  address: string;
}

const DEFAULT_BRANDING_PRINT_CONFIG: BrandingPrintConfig = {
  systemName: 'Banque Alimentaire',
  phone: '',
  address: '',
};

function sanitizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeBrandingPrintConfig(
  config?: Partial<BrandingPrintConfig> | null,
): BrandingPrintConfig {
  return {
    systemName: sanitizeString(config?.systemName) || DEFAULT_BRANDING_PRINT_CONFIG.systemName,
    phone: sanitizeString(config?.phone),
    address: sanitizeString(config?.address),
  };
}

export function getStoredBrandingPrintConfig(): BrandingPrintConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_BRANDING_PRINT_CONFIG;
  }

  try {
    const savedConfig = window.localStorage.getItem('brandingConfig_permanent');
    if (!savedConfig) {
      return DEFAULT_BRANDING_PRINT_CONFIG;
    }

    return normalizeBrandingPrintConfig(JSON.parse(savedConfig));
  } catch {
    return DEFAULT_BRANDING_PRINT_CONFIG;
  }
}

export function formatBrandingContactLine(
  config?: Partial<BrandingPrintConfig> | null,
  separator = ' | ',
): string {
  const normalized = normalizeBrandingPrintConfig(config);

  return [normalized.phone, normalized.address]
    .filter((value) => value !== '')
    .join(separator);
}