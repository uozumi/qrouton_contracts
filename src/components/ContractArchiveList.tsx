const calculatePlanCounts = (contracts: Contract[]) => {
  // 全てのプランを取得
  const allPlans = plans.map(plan => plan.name);
  
  // 契約があるプランの件数を計算
  const counts = contracts.reduce((acc, contract) => {
    const planName = contract.plan?.name || '不明';
    acc[planName] = (acc[planName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 全てのプランについて、契約件数を設定（契約がない場合は0）
  const result = allPlans.map(planName => ({
    planName,
    count: counts[planName] || 0
  }));

  // 件数の多い順にソート
  return result.sort((a, b) => b.count - a.count);
};

                  <TableBody>
                    {calculatePlanCounts(filteredContracts).map(({ planName, count }) => (
                      <TableRow key={planName}>
                        <TableCell>{planName}</TableCell>
                        <TableCell align="right">{count}件</TableCell>
                      </TableRow>
                    ))}
                  </TableBody> 