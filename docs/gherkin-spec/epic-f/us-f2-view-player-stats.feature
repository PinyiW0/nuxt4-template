# language: zh-TW
# encoding: UTF-8
# Feature: 查看選手統計
# Epic: F - 選手分析（長期表現追蹤）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 選手統計已顯示
# @requires: us-f1-query-player-records
# Allowed Roles: 管理者, 教練

@epic-f @player @query
Feature: 查看選手統計
  身為 分析使用者
  我想要 查看選手的月平均統計與分佈圖
  以便 追蹤長期表現

  Background:
    Given 使用者已登入系統
    And 使用者已進入影像數據分析頁面
    And 系統中存在選手 "王小明"

  # ===== Phase 2: 核心業務 =====

  Rule: 可查看選手的月平均統計

    @happy-path
    Example: 查看月平均統計
      Given 使用者為「教練」角色
      And 選手 "王小明" 有以下月份統計:
        | 月份    | 平均球速   | 好球率 |
        | 2026-01 | 118 km/h   | 65%    |
        | 2025-12 | 115 km/h   | 60%    |
      When 使用者 查看選手 "王小明" 的統計
      Then 應顯示月平均統計表
      And 應顯示 2026-01 平均球速為 "118 km/h"
      And 應顯示 2026-01 好球率為 "65%"

  Rule: 可查看選手的熱區圖

    @happy-path
    Example: 查看熱區圖
      Given 使用者為「教練」角色
      And 選手 "王小明" 有投球落點分佈資料
      When 使用者 查看選手 "王小明" 的統計
      Then 應顯示熱區圖
      And 熱區圖應標示最常投球的區域

  Rule: 可選擇統計期間

    @happy-path
    Example: 查看特定期間統計
      Given 使用者為「教練」角色
      When 使用者 查看選手 "王小明" 的統計，期間為 "2026-01" 到 "2026-03"
      Then 應顯示該期間的統計資料

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法查看不存在的選手

    @error-handling
    Example: 查看不存在選手的統計
      Given 使用者為「教練」角色
      When 使用者 查看選手 "不存在" 的統計
      Then 應回傳錯誤 "找不到指定的選手"

  Rule: 無統計資料時顯示空白

    @boundary
    Example: 選手無統計資料
      Given 使用者為「教練」角色
      And 選手 "王小明" 尚無投球記錄
      When 使用者 查看選手 "王小明" 的統計
      Then 應顯示空白統計
      And 應提示 "尚無統計資料"
