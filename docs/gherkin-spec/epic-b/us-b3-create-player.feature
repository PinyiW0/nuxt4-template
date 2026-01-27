# language: zh-TW
# encoding: UTF-8
# Feature: 新增球員
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 球員已建立
# @requires: us-b1-select-team
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-001: 背號同一球隊內唯一
#   - BD-B001: 背號範圍 0-99

@epic-b @player @command
Feature: 新增球員
  身為 管理者/教練
  我想要 新增球員到球隊
  以便 維護球員名單

  Background:
    Given 使用者已登入系統
    And 系統中存在球隊 "閃電隊"

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可對任意球隊新增球員

    @permission @happy-path
    Example: 管理者新增球員
      Given 使用者為「管理者」角色
      And 球隊 "閃電隊" 的建立者為 "coach1"
      When 使用者 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 1，守位 "P"，排序 1
      Then 球隊 "閃電隊" 應有球員 "王小明"

  Rule: 教練只能對自己的球隊新增球員

    @permission @happy-path
    Example: 教練新增球員到自己的球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach1"
      When 使用者 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 1，守位 "P"，排序 1
      Then 球隊 "閃電隊" 應有球員 "王小明"

    @permission @error-handling
    Example: 教練無法對他人球隊新增球員
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach2"
      When 使用者 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 1，守位 "P"，排序 1
      Then 應回傳錯誤 "無權限操作此球隊"

  # ===== Phase 2: 核心業務 =====

  Rule: 背號在同一球隊內必須唯一

    @happy-path
    Example: 成功新增球員
      Given 使用者為「管理者」角色
      When 使用者 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 1，守位 "P"，排序 1
      Then 球隊 "閃電隊" 應有球員 "王小明"
      And 球員 "王小明" 背號應為 1

    @error-handling
    Example: 新增重複背號的球員應失敗
      Given 使用者為「管理者」角色
      And 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 使用者 新增球員到球隊 "閃電隊"，姓名 "李小華"，背號 1，守位 "C"，排序 2
      Then 應回傳錯誤 "背號已被使用"

    @happy-path
    Example: 不同球隊可使用相同背號
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "勇士隊"
      And 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 使用者 新增球員到球隊 "勇士隊"，姓名 "張大華"，背號 1，守位 "C"，排序 1
      Then 球隊 "勇士隊" 應有球員 "張大華"

  Rule: 背號範圍為 0-99

    @boundary
    Example: 背號為 0 應成功
      Given 使用者為「管理者」角色
      When 使用者 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 0，守位 "P"，排序 1
      Then 球員 "王小明" 背號應為 0

    @boundary
    Example: 背號為 99 應成功
      Given 使用者為「管理者」角色
      When 使用者 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 99，守位 "P"，排序 1
      Then 球員 "王小明" 背號應為 99

    @boundary @error-handling
    Example: 背號超過 99 應失敗
      Given 使用者為「管理者」角色
      When 使用者 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 100，守位 "P"，排序 1
      Then 應回傳錯誤 "背號必須在 0-99 之間"

    @boundary @error-handling
    Example: 背號為負數應失敗
      Given 使用者為「管理者」角色
      When 使用者 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 -1，守位 "P"，排序 1
      Then 應回傳錯誤 "背號必須在 0-99 之間"

  # ===== Phase 3: 邊界條件 =====

  Rule: 必填欄位不可為空

    @boundary @error-handling
    Example: 姓名為空應失敗
      Given 使用者為「管理者」角色
      When 使用者 新增球員到球隊 "閃電隊"，姓名 ""，背號 1，守位 "P"，排序 1
      Then 應回傳錯誤 "姓名不可為空"

    @boundary @error-handling
    Example: 未指定排序應失敗
      Given 使用者為「管理者」角色
      When 使用者 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 1，守位 "P"
      Then 應回傳錯誤 "必須指定排序"
