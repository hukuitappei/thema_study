export const uiCopy = {
  hero: {
    eyebrow: "TypeScript + Python の基盤",
    title: "FastAPI と React の型安全な疎通を先に成立させる",
    lead:
      "バックエンドの OpenAPI を正として、フロントエンドは生成型を使って通信します。",
  },
  auth: {
    heading: "認証",
    status: {
      checking: "セッション確認中",
      authenticated: "認証済み",
      anonymous: "未認証",
    },
    logout: "ログアウト",
    summary: (username: string) => `@${username} としてアイテム操作が可能です。`,
    login: {
      title: "ログイン",
      username: "ユーザー名",
      password: "パスワード",
      submit: "ログイン",
      submitting: "ログイン中...",
    },
    register: {
      title: "ユーザー登録",
      displayName: "表示名",
      username: "ユーザー名",
      password: "パスワード",
      submit: "ユーザー登録",
      submitting: "登録中...",
    },
    notices: {
      restored: (displayName: string) => `ログイン中: ${displayName}`,
      loggedIn: (displayName: string) => `ログインしました: ${displayName}`,
      registered: (displayName: string) =>
        `${displayName} を登録しました。続けてログインしてください。`,
      sessionExpired:
        "保存されていたセッションは無効でした。再度ログインしてください。",
      loggedOut: "ログアウトしました。",
    },
    validation: {
      loginUsernameRequired: "ユーザー名を入力してください。",
      loginPasswordRequired: "パスワードを入力してください。",
      displayNameRequired: "表示名: 入力してください。",
      displayNameTooLong: "表示名: 64文字以内にしてください。",
      usernameRequired: "ユーザー名: 入力してください。",
      usernameTooShort: "ユーザー名: 3文字以上にしてください。",
      usernameTooLong: "ユーザー名: 32文字以内にしてください。",
      usernamePattern:
        "ユーザー名: 英数字とアンダースコアのみ使用できます。",
      passwordRequired: "パスワード: 入力してください。",
      passwordTooShort: "パスワード: 8文字以上にしてください。",
      passwordTooLong: "パスワード: 128文字以内にしてください。",
      loginFailed: "ログインに失敗しました。",
      registerFailed: "ユーザー登録に失敗しました。",
    },
  },
  account: {
    heading: "アカウント設定",
    profileTitle: "プロフィール更新",
    passwordTitle: "パスワード変更",
    displayName: "表示名",
    currentPassword: "現在のパスワード",
    newPassword: "新しいパスワード",
    profileSubmit: "プロフィール更新",
    profileSubmitting: "更新中...",
    passwordSubmit: "パスワード変更",
    passwordSubmitting: "変更中...",
    validation: {
      displayNameRequired: "表示名を入力してください。",
      passwordRequired:
        "現在のパスワードと新しいパスワードを入力してください。",
      profileFailed: "プロフィール更新に失敗しました。",
      passwordFailed: "パスワード変更に失敗しました。",
    },
    notices: {
      profileUpdated: (displayName: string) =>
        `プロフィールを更新しました: ${displayName}`,
      passwordChanged:
        "パスワードを変更しました。再度ログインしてください。",
    },
  },
  items: {
    status: {
      heading: "API 状態",
      loading: "読み込み中...",
      loadFailed: "読み込みに失敗しました。",
      pageError: (message: string) => `初期化エラー: ${message}`,
      ariaLabel: "API status",
      labels: {
        status: "Status",
        service: "Service",
        version: "Version",
      },
    },
    editor: {
      createHeading: "アイテム追加",
      editHeading: "アイテム編集",
      cancel: "キャンセル",
      title: "タイトル",
      description: "説明",
      tags: "タグ",
      titlePlaceholder: "例: API contract を更新する",
      descriptionPlaceholder: "背景や対応内容をメモする",
      tagsPlaceholder: "例: api, fastapi, auth",
      createSubmit: "追加する",
      editSubmit: "更新する",
      submitting: "送信中...",
      authRequired:
        "アイテムの追加・編集・削除にはログインが必要です。",
      validation: {
        titleRequired: "タイトルは必須です。",
        titleTooLong: "タイトルは120文字以内にしてください。",
        tooManyTags: "タグは10件以内にしてください。",
      },
    },
    list: {
      heading: "サンプルデータ",
      headerPage: (current: number, total: number) => `${current} / ${total} ページ`,
      pageIndicator: (current: number, total: number) => `ページ ${current} / ${total}`,
      summaryAll: (count: number) => `全 ${count} 件を表示中`,
      summaryTag: (tag: string, count: number) => `#${tag} で ${count} 件を表示中`,
      emptyByTag: (tag: string) => `#${tag} に一致するアイテムはありません。`,
      emptyMine: "自分のアイテムはまだありません。",
      emptyAll: "条件に一致するアイテムはありません。",
      controls: {
        ownership: "表示範囲",
        search: "検索",
        sort: "並び順",
        searchPlaceholder: "タイトル・説明・タグで絞り込む",
      },
      pagination: {
        ariaLabel: "ページネーション",
        previous: "前へ",
        next: "次へ",
        summary: (shown: number, total: number) =>
          `全 ${total} 件中 ${shown} 件を表示中`,
      },
      card: {
        owner: (displayName: string, username: string) =>
          `作成者: ${displayName} (@${username})`,
        noDescription: "説明はありません。",
        edit: "編集",
        delete: "削除",
      },
      sortOptions: {
        newest: "新しい順",
        oldest: "古い順",
        title: "タイトル順",
      },
      ownershipOptions: {
        all: "全体",
        mine: "自分のアイテム",
      },
    },
    mutations: {
      created: "アイテムを追加しました。",
      updated: "アイテムを更新しました。",
      deleted: "アイテムを削除しました。",
      createOrUpdateFailed: "アイテム操作に失敗しました。",
      deleteFailed: "アイテム削除に失敗しました。",
    },
  },
  tags: {
    title: "人気タグ",
    caption: (count: number, selectedTag: string | null) =>
      `タグ ${count} 件 / 現在: ${selectedTag ? `#${selectedTag}` : "すべて"}`,
    overflow: (count: number, expanded: boolean) =>
      expanded ? `${count} 件を表示中` : `上位 ${count} 件を表示中`,
    more: "もっと見る",
    less: "たたむ",
    sortLabel: "タグ並び順",
    sortPopular: "人気順",
    sortName: "名前順",
    all: "すべて",
    ariaLabel: "タグ絞り込み",
  },
};
