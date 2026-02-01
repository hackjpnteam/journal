# Ultimate Morning

毎朝7時の宣言で1日を始める日報共有アプリ

## 起動方法

1. MongoDBを起動
```bash
# ローカルの場合
mongod
# または MongoDB Atlas を使用
```

2. 環境変数を設定
```bash
cp .env.local.example .env.local
# .env.local を編集してMONGODB_URIとNEXTAUTH_SECRETを設定
```

3. 依存関係をインストール
```bash
npm install
```

4. 開発サーバーを起動
```bash
npm run dev
```

5. ブラウザで http://localhost:3000 を開く

## 主な機能

- **7:00共有**: 毎朝7:00〜7:15の間だけ今日の宣言を投稿可能
- **顔マーク**: 5段階の状態表現（😵‍💫😐🙂🔥🌱）
- **OKR**: 週間・月間の目標設定
- **カレンダー**: 投稿履歴の月・年表示
- **コーチング**: コーチによる赤入れ・問い機能

## コーチ設定

`.env.local` の `COACH_EMAIL` に指定したメールアドレスで登録したユーザーがコーチになります。
