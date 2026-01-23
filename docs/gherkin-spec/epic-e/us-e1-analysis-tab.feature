# language: zh-TW
# encoding: UTF-8
# Feature: 分析區分頁切換
# Epic: E - 影像數據分析（歷史訓練）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-e @analysis @query
Feature: 分析區分頁切換
  身為 分析使用者
  我想要 在分析區切換「訓練記錄查詢」與「選手紀錄查詢」
  以便 分別查看不同維度的資料

  Background:
    Given 分析使用者 已登入系統

  Rule: 可以切換分析分頁

    @happy-path
    Example: 切換到訓練記錄查詢
      Given 目前在「選手紀錄查詢」分頁
      When 分析使用者 切換到「訓練記錄查詢」分頁
      Then 應顯示「訓練記錄查詢」分頁內容

    @happy-path
    Example: 切換到選手紀錄查詢
      Given 目前在「訓練記錄查詢」分頁
      When 分析使用者 切換到「選手紀錄查詢」分頁
      Then 應顯示「選手紀錄查詢」分頁內容

  Rule: 預設顯示訓練記錄查詢

    @happy-path
    Example: 進入分析區預設顯示訓練記錄
      When 分析使用者 進入影像數據分析區
      Then 應預設顯示「訓練記錄查詢」分頁
