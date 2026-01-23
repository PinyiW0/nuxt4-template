# language: zh-TW
# encoding: UTF-8
# Feature: AI 系統控制
# Epic: C - 訓練建立與 AI 系統控制
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-c @ai-system @command
Feature: AI 系統控制
  身為 教練
  我想要 啟動/關閉 AI 偵測系統
  以便 控制現場系統狀態

  Background:
    Given 教練 已登入系統

  Rule: 可以啟動 AI 系統

    @happy-path
    Example: 成功啟動 AI 系統
      Given AI 系統目前未運作
      When 教練 啟動 AI 系統
      Then AI 系統應為運作中
      And 應顯示 AI 系統狀態為 "運作中"

    @error-handling
    Example: AI 系統已運作中時無法再次啟動
      Given AI 系統目前運作中
      When 教練 啟動 AI 系統
      Then 應回傳錯誤 "AI 系統已在運作中"

  Rule: 可以關閉 AI 系統

    @happy-path
    Example: 成功關閉 AI 系統
      Given AI 系統目前運作中
      When 教練 關閉 AI 系統
      Then AI 系統應為未運作
      And 應顯示 AI 系統狀態為 "已停止"

    @error-handling
    Example: AI 系統未運作時無法關閉
      Given AI 系統目前未運作
      When 教練 關閉 AI 系統
      Then 應回傳錯誤 "AI 系統未運作"

  Rule: 可以查詢 AI 系統狀態

    @happy-path
    Example: 查詢 AI 系統狀態 - 運作中
      Given AI 系統目前運作中
      When 教練 查詢 AI 系統狀態
      Then 應顯示 AI 系統狀態為 "運作中"

    @happy-path
    Example: 查詢 AI 系統狀態 - 已停止
      Given AI 系統目前未運作
      When 教練 查詢 AI 系統狀態
      Then 應顯示 AI 系統狀態為 "已停止"
