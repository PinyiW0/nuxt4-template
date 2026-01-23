# language: zh-TW
# encoding: UTF-8
# Feature: 新增球員
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23
# Boundary Decisions:
#   - Q1: 背號同一球隊內唯一

@epic-b @player @command
Feature: 新增球員
  身為 教練
  我想要 新增球員到球隊
  以便 維護球員名單

  Background:
    Given 教練 已登入系統
    And 系統中存在球隊 "閃電隊"

  Rule: 背號在同一球隊內必須唯一

    @happy-path
    Example: 成功新增球員
      When 教練 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 1，守位 "P"，身高 175，排序 1
      Then 球隊 "閃電隊" 應有球員 "王小明"
      And 球員 "王小明" 背號應為 1

    @error-handling
    Example: 新增重複背號的球員應失敗
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 教練 新增球員到球隊 "閃電隊"，姓名 "李小華"，背號 1，守位 "C"，身高 180，排序 2
      Then 應回傳錯誤 "背號已被使用"

    @happy-path
    Example: 不同球隊可使用相同背號
      Given 系統中存在球隊 "勇士隊"
      And 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 教練 新增球員到球隊 "勇士隊"，姓名 "張大華"，背號 1，守位 "C"，身高 178，排序 1
      Then 球隊 "勇士隊" 應有球員 "張大華"
      And 球員 "張大華" 背號應為 1

  Rule: 背號範圍為 0-99

    @boundary
    Example: 背號為 0 應成功
      When 教練 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 0，守位 "P"，身高 175，排序 1
      Then 球員 "王小明" 背號應為 0

    @boundary
    Example: 背號為 99 應成功
      When 教練 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 99，守位 "P"，身高 175，排序 1
      Then 球員 "王小明" 背號應為 99

    @boundary
    Example: 背號為 100 應失敗
      When 教練 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 100，守位 "P"，身高 175，排序 1
      Then 應回傳錯誤 "背號必須在 0-99 之間"

    @boundary
    Example: 背號為負數應失敗
      When 教練 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 -1，守位 "P"，身高 175，排序 1
      Then 應回傳錯誤 "背號必須在 0-99 之間"

  Rule: 球員姓名不可為空

    @boundary
    Example: 球員姓名為空應失敗
      When 教練 新增球員到球隊 "閃電隊"，姓名 ""，背號 1，守位 "P"，身高 175，排序 1
      Then 應回傳錯誤 "球員姓名不可為空"

  Rule: 球隊必須存在

    @error-handling
    Example: 新增球員到不存在的球隊應失敗
      Given 系統中沒有球隊 "幽靈隊"
      When 教練 新增球員到球隊 "幽靈隊"，姓名 "王小明"，背號 1，守位 "P"，身高 175，排序 1
      Then 應回傳錯誤 "找不到指定的球隊"
