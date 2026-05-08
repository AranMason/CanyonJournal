import { useEffect, useState } from 'react';
import { CanyonRecord } from '../types/CanyonRecord';
import { Canyon } from '../types/Canyon';
import { UserCanyon } from '../types/UserCanyon';
import { apiFetch } from '../utils/api';
import { loadById } from '../helpers/CanyonDataStore';

interface UseCanyonRecordsResult {
  records: CanyonRecord[];
  canyonsById: { [id: number]: Canyon };
  userCanyonsById: { [id: number]: UserCanyon };
  isLoading: boolean;
}

export function useCanyonRecords(url: string, enabled: boolean): UseCanyonRecordsResult {
  const [records, setRecords] = useState<CanyonRecord[]>([]);
  const [canyonsById, setCanyonsById] = useState<{ [id: number]: Canyon }>({});
  const [userCanyonsById, setUserCanyonsById] = useState<{ [id: number]: UserCanyon }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setRecords([]);
      return;
    }
    setIsLoading(true);
    Promise.all([
      apiFetch<{ records: CanyonRecord[] }>(url),
      loadById(),
      apiFetch<UserCanyon[]>('/api/user-canyons'),
    ]).then(([data, canyons, userCanyons]) => {
      setRecords(data.records || []);
      setCanyonsById(canyons);
      const ucById: { [id: number]: UserCanyon } = {};
      userCanyons.forEach(uc => { ucById[uc.Id] = uc; });
      setUserCanyonsById(ucById);
    }).finally(() => setIsLoading(false));
  }, [url, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { records, canyonsById, userCanyonsById, isLoading };
}
