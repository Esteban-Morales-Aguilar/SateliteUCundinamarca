import { useQuery } from '@tanstack/react-query';
import { telemetryService } from '../services/telemetry.service';

export function usePiTelemetry() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pi-telemetry'],
    queryFn: telemetryService.latest,
    refetchInterval: 5000,
    retry: false,
  });

  // Check if the data is from the Pi (mission_id matches)
  const isPiData = data?.mission_id === 'ESTRATOSAT-TELCO-01';

  return {
    latest: isPiData ? data : null,
    connected: isPiData,
    isLoading,
    isError,
  };
}
