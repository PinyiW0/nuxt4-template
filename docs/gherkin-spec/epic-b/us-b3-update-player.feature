# language: zh-TW
# encoding: UTF-8
# Feature: 編輯球員
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23
# Boundary Decisions:
#   - Q1: 背號同一球隊內唯一

@epic-b @player @command
Feature: 編輯球員
  身為 教練
  我想要 編輯球員資料
  以便 確保球員名單正確

  Background:
    Given 教練 已登入系統
    And 系統中存在球隊 "閃電隊"

  Rule: 可以編輯球員基本資料

    @happy-path
    Example: 成功編輯球員姓名
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 教練 編輯球員 "王小明" 姓名為 "王大明"
      Then 球隊 "閃電隊" 應有球員 "王大明"
      And 球員 "王大明" 背號應為 1

    @happy-path
    Example: 成功編輯球員背號
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 教練 編輯球員 "王小明" 背號為 10
      Then 球員 "王小明" 背號應為 10

    @happy-path
    Example: 成功編輯球員守位
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1，守位 "P"
      When 教練 編輯球員 "王小明" 守位為 "C"
      Then 球員 "王小明" 守位應為 "C"

  Rule: 編輯背號不可與同隊其他球員重複

    @error-handling
    Example: 編輯為已存在的背號應失敗
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
      And 球隊 "閃電隊" 有球員 "李小華"，背號 2
      When 教練 編輯球員 "王小明" 背號為 2
      Then 應回傳錯誤 "背號已被使用"

    @happy-path
    Example: 保持原背號應成功
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 教練 編輯球員 "王小明" 姓名為 "王大明"，背號為 1
      Then 球員 "王大明" 背號應為 1

  Rule: 編輯不存在的球員應失敗

    @error-handling
    Example: 編輯不存在的球員應失敗
      Given 球隊 "閃電隊" 沒有球員 "幽靈球員"
      When 教練 編輯球員 "幽靈球員" 姓名為 "新名字"
      Then 應回傳錯誤 "找不到指定的球員"
