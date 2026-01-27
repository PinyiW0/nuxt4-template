# language: zh-TW
# encoding: UTF-8
# Feature: 切換分析頁籤
# Epic: E - 影像數據分析（歷史訓練）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 分析頁籤已切換
# Allowed Roles: 管理者, 教練

@epic-e @ui @command
Feature: 切換分析頁籤
  身為 分析使用者
  我想要 在分析區切換「訓練記錄查詢」與「選手紀錄查詢」
  以便 分別查看不同維度的資料

  Background:
    Given 使用者已登入系統
    And 使用者已進入影像數據分析頁面

  # ===== Phase 2: 核心業務 =====

  Rule: 可切換到訓練記錄查詢頁籤

    @happy-path
    Example: 切換到訓練記錄查詢
      Given 使用者為「教練」角色
      When 使用者 切換到 "訓練記錄查詢" 頁籤
      Then 應顯示訓練記錄查詢介面

  Rule: 可切換到選手紀錄查詢頁籤

    @happy-path
    Example: 切換到選手紀錄查詢
      Given 使用者為「教練」角色
      When 使用者 切換到 "選手紀錄查詢" 頁籤
      Then 應顯示選手紀錄查詢介面
