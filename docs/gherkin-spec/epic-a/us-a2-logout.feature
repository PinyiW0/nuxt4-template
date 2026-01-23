# language: zh-TW
# encoding: UTF-8
# Feature: 使用者登出
# Epic: A - 登入/登出與權限控管
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-a @user @command
Feature: 使用者登出
  身為 已登入使用者
  我想要 登出並清除 token
  以便 避免他人使用我的帳號

  Rule: 已登入使用者可以登出

    @happy-path
    Example: 成功登出系統
      Given 使用者 "coach01" 已登入系統
      When 使用者 點擊登出按鈕
      Then 應成功登出系統
      And 應清除 token
      And 應回到登入頁面

  Rule: 未登入狀態無法執行登出

    @error-handling
    Example: 未登入時無法登出
      Given 使用者 未登入
      When 使用者 嘗試登出
      Then 應回傳錯誤 "未授權的操作"
