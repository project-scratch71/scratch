# ベースイメージに Node.js 18 を使用
FROM node:18-slim

# 作業ディレクトリを /app に設定
WORKDIR /app

# 依存関係のみ先にコピーしてインストール（キャッシュを効かせるため）
COPY package.json package-lock.json ./
# パッチファイルとスクリプトを先にコピー（postinstallとprepublishスクリプトのため）
COPY patches ./patches
COPY scripts ./scripts
RUN npm install

# ソースコード全体をコピー
COPY . .

# ポート開放（scratch-gui がデフォルトで8601を使う設定だった）
EXPOSE 8601

# デフォルトコマンドは開発サーバー起動
CMD ["npm", "start"]