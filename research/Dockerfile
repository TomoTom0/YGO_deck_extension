FROM python:3.11-slim

# システムパッケージの更新とPlaywrightの依存関係をインストール
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    xvfb \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリを設定
WORKDIR /app

# Ryeをインストール
RUN curl -sSf https://rye.astral.sh/get | RYE_INSTALL_OPTION="--yes" bash
ENV PATH="/root/.rye/shims:$PATH"

# 依存関係ファイルをコピー
COPY pyproject.toml requirements*.lock ./

# 依存関係をインストール
RUN rye sync --no-dev

# Playwrightブラウザをインストール
RUN rye run playwright install chromium

# アプリケーションファイルをコピー
COPY . .

# 環境変数を設定
ENV PYTHONPATH=/app
ENV DISPLAY=:99

# エントリーポイント
CMD ["python", "src/playwright_analyzer.py"]