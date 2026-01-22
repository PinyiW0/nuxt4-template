# language: zh-TW
# encoding: UTF-8
# Feature: 切換分析頁籤
# Epic: E - 影像數據分析（歷史訓練）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-e @analysis @command
Feature: 切換分析頁籤
  身為 數據分析師
  我想要 切換分析頁籤
  以便 在訓練紀錄和選手紀錄之間切換

  Rule: 頁籤切換

    @happy-path
    Example: 切換至訓練紀錄頁籤
      Given 數據分析師 目前在選手紀錄頁籤
      When 數據分析師 切換至 "訓練紀錄" 頁籤
      Then 應顯示訓練紀錄頁籤內容
      And 應載入訓練列表

    @happy-path
    Example: 切換至選手紀錄頁籤
      Given 數據分析師 目前在訓練紀錄頁籤
      When 數據分析師 切換至 "選手紀錄" 頁籤
      Then 應顯示選手紀錄頁籤內容
      And 應載入選手列表

    @happy-path
    Example: 預設顯示訓練紀錄頁籤
      When 數據分析師 進入分析頁面
      Then 應預設顯示訓練紀錄頁籤
