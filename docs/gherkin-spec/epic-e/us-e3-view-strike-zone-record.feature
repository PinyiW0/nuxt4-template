# language: zh-TW
# encoding: UTF-8
# Feature: 查看好球帶記錄
# Epic: E - 影像數據分析（歷史訓練）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 好球帶記錄已顯示
# @requires: us-e2-query-historical-trainings
# Allowed Roles: 管理者, 教練

@epic-e @strike-zone @query
Feature: 查看好球帶記錄
  身為 分析使用者
  我想要 查看單筆訓練的電子好球帶記錄
  以便 檢視每球的投球品質

  Background:
    Given 使用者已登入系統
    And 使用者已進入影像數據分析頁面
    And 系統中存在訓練 "訓練A"

  # ===== Phase 2: 核心業務 =====

  Rule: 可查看訓練的電子好球帶記錄

    @happy-path
    Example: 查看好球帶記錄
      Given 使用者為「教練」角色
      And 訓練 "訓練A" 有以下投球:
        | 球序 | 結果 | 落點 |
        | 1    | 好球 | 5    |
        | 2    | 壞球 | 1    |
        | 3    | 好球 | 9    |
      When 使用者 查看訓練 "訓練A" 的好球帶記錄
      Then 應顯示好球帶視覺化圖表
      And 應顯示每球的落點位置
      And 應顯示好壞球判定結果

  Rule: 好球帶記錄應包含統計資訊

    @happy-path
    Example: 顯示好壞球統計
      Given 使用者為「教練」角色
      And 訓練 "訓練A" 有 10 筆投球，其中 6 好球 4 壞球
      When 使用者 查看訓練 "訓練A" 的好球帶記錄
      Then 應顯示好球數為 6
      And 應顯示壞球數為 4
      And 應顯示好球率為 60%

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法查看不存在的訓練

    @error-handling
    Example: 查看不存在訓練的記錄
      Given 使用者為「教練」角色
      And 系統中不存在訓練 "幽靈訓練"
      When 使用者 查看訓練 "幽靈訓練" 的好球帶記錄
      Then 應回傳錯誤 "找不到指定的訓練"

  Rule: 無投球記錄時顯示空白

    @boundary
    Example: 訓練無投球記錄
      Given 使用者為「教練」角色
      And 訓練 "訓練A" 沒有任何投球
      When 使用者 查看訓練 "訓練A" 的好球帶記錄
      Then 應顯示空白好球帶
      And 應提示 "尚無投球記錄"
