import { useEffect, useState } from 'react';
import { CanyonRecord } from '../types/CanyonRecord';
import { Canyon } from '../types/Canyon';
import { UserCanyon } from '../types/UserCanyon';
import { loadById as loadBaseCanyonsById } from '../helpers/CanyonDataStore';
import { loadById as loadUserCanyonsById } from '../helpers/UserCanyonDataStore';

interface UseCanyonRecordsResult {
  records: CanyonRecord[];
  canyonsById: { [id: number]: Canyon };
  userCanyonsById: { [id: number]: UserCanyon };
  isLoading: boolean;
  removeRecord: (id: number) => void;
}

export function useCanyonRecords(fetchRecords: () => Promise<CanyonRecord[]>, enabled: boolean): UseCanyonRecordsResult {
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
      fetchRecords(),
      loadBaseCanyonsById(),
      loadUserCanyonsById(),
    ]).then(([data, canyons, ucById]) => {
      setRecords(data || []);
      setCanyonsById(canyons);
      setUserCanyonsById(ucById);
    }).finally(() => setIsLoading(false));
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeRecord = (id: number) => setRecords(prev => prev.filter(r => r.Id !== id));

  return { records, canyonsById, userCanyonsById, isLoading, removeRecord };
}
