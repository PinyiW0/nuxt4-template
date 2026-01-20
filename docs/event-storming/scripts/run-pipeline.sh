#!/bin/bash

# Event Storming Pipeline 執行腳本
# 用途：依序執行 6 個階段的 Event Storming 流程

set -e  # 遇到錯誤立即停止

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 檢查參數
if [ "$#" -ne 1 ]; then
    echo -e "${RED}使用方式: $0 <USER_STORY_ID>${NC}"
    echo "範例: $0 US-B1"
    exit 1
fi

USER_STORY_ID=$1
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
EVENT_STORMING_DIR="$PROJECT_ROOT/docs/event-storming"
EXAMPLES_DIR="$EVENT_STORMING_DIR/examples/$USER_STORY_ID"
USER_STORIES_DIR="$PROJECT_ROOT/docs/user-stories"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Event Storming Pipeline${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "User Story ID: ${GREEN}$USER_STORY_ID${NC}"
echo -e "輸出目錄: ${GREEN}$EXAMPLES_DIR${NC}"
echo ""

# 建立輸出目錄
mkdir -p "$EXAMPLES_DIR"

# 檢查 User Story 是否存在
USER_STORY_FILE=$(find "$USER_STORIES_DIR" -name "*.md" -type f | head -n 1)
if [ ! -f "$USER_STORY_FILE" ]; then
    echo -e "${RED}錯誤: 找不到 User Story 檔案${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 找到 User Story: $USER_STORY_FILE"
echo ""

# 函式：顯示階段標題
show_stage() {
    local stage_num=$1
    local stage_name=$2
    echo -e "${BLUE}----------------------------------------${NC}"
    echo -e "${BLUE}Stage $stage_num: $stage_name${NC}"
    echo -e "${BLUE}----------------------------------------${NC}"
}

# 函式：等待用戶確認
wait_for_user() {
    echo ""
    read -p "按 Enter 繼續到下一階段..."
    echo ""
}

# Stage 1: Domain Events 識別
show_stage 1 "Domain Events 識別"
echo "請使用 GitHub Copilot 執行以下操作："
echo "1. 開啟 prompts/stage1-domain-events.md"
echo "2. 將 User Story 內容貼入 Prompt"
echo "3. 執行 Copilot 並將輸出儲存至："
echo "   $EXAMPLES_DIR/01-domain-events.json"
wait_for_user

# 檢查輸出是否存在
if [ ! -f "$EXAMPLES_DIR/01-domain-events.json" ]; then
    echo -e "${YELLOW}警告: 找不到 Stage 1 輸出檔案${NC}"
    echo "是否繼續？(y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi

# Stage 2: Commands 萃取
show_stage 2 "Commands 萃取"
echo "請使用 GitHub Copilot 執行以下操作："
echo "1. 開啟 prompts/stage2-commands.md"
echo "2. 將 Stage 1 的輸出貼入 Prompt"
echo "3. 執行 Copilot 並將輸出儲存至："
echo "   $EXAMPLES_DIR/02-commands.json"
wait_for_user

# Stage 3: Aggregates & Entities 定義
show_stage 3 "Aggregates & Entities 定義"
echo "請使用 GitHub Copilot 執行以下操作："
echo "1. 開啟 prompts/stage3-aggregates.md"
echo "2. 將 Stage 1 和 Stage 2 的輸出貼入 Prompt"
echo "3. 執行 Copilot 並將輸出儲存至："
echo "   $EXAMPLES_DIR/03-aggregates.json"
wait_for_user

# Stage 4: Policies & Business Rules 梳理
show_stage 4 "Policies & Business Rules 梳理"
echo "請使用 GitHub Copilot 執行以下操作："
echo "1. 開啟 prompts/stage4-policies.md"
echo "2. 將 Stage 2 和 Stage 3 的輸出貼入 Prompt"
echo "3. 執行 Copilot 並將輸出儲存至："
echo "   $EXAMPLES_DIR/04-policies.json"
wait_for_user

# Stage 5: Read Models & Views 設計
show_stage 5 "Read Models & Views 設計"
echo "請使用 GitHub Copilot 執行以下操作："
echo "1. 開啟 prompts/stage5-read-models.md"
echo "2. 將所有前階段的輸出貼入 Prompt"
echo "3. 執行 Copilot 並將輸出儲存至："
echo "   $EXAMPLES_DIR/05-read-models.json"
wait_for_user

# Stage 6: Gherkin Scenarios 生成
show_stage 6 "Gherkin Scenarios 生成"
echo "請使用 GitHub Copilot 執行以下操作："
echo "1. 開啟 prompts/stage6-gherkin.md"
echo "2. 將所有前階段的輸出貼入 Prompt"
echo "3. 執行 Copilot 並將輸出儲存至："
echo "   $EXAMPLES_DIR/06-scenarios.feature"
wait_for_user

# 完成
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Event Storming Pipeline 完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "產出的檔案位於："
echo "  $EXAMPLES_DIR"
echo ""
echo "包含以下檔案："
echo "  - 01-domain-events.json"
echo "  - 02-commands.json"
echo "  - 03-aggregates.json"
echo "  - 04-policies.json"
echo "  - 05-read-models.json"
echo "  - 06-scenarios.feature"
echo ""
echo "下一步："
echo "  1. 檢查 Gherkin scenarios 是否完整"
echo "  2. 根據 scenarios 實作功能"
echo "  3. 執行 BDD 測試"
