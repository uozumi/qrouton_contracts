interface ClientFormatProps {
  name: string;
  department?: string | null;
}

/**
 * クライアント名と部署名を統合した表示形式を生成する
 * @param client - クライアント情報（名前と部署）
 * @returns "{会社名}（{部署名}）" 形式の文字列、部署がない場合は会社名のみ
 */
export const formatClientName = (client: ClientFormatProps): string => {
  return client.department 
    ? `${client.name}（${client.department}）`
    : client.name;
}; 