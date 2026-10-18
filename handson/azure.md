# Azure Container Appsへ公開する（任意）

動くプレビューで発表するだけなら、このページの作業は不要です。[READMEの確認・PR](../README.md#share)まで済ませ、継続して使うURLが必要なチームが運営と進めます。画面とAPIを1つのコンテナにまとめ、CIでテストした同じイメージをGHCRからAzureへ配置します。PCへのDocker導入は必須ではありません。

この初心者向けコースでは、[Forkの手順](../README.md#fork)で設定した **`codex/beginner-starter`** がチームのデフォルトブランチです。以下のPRの統合先、手動実行のブランチ、Environmentの許可ブランチには、その名前を使います。

チームの代表者が運営・メンターと一度行う準備です。準備後は、学生はGitHubのPRをマージする操作で更新できます。対象は通常の **Azure Container Apps（Consumption）**です。

必要なのは、チームリポジトリの設定変更権限、Azureでリソースを作成する権限とロールを割り当てる権限です。使うサブスクリプションとチーム用リソースグループを決めます。学生クレジットは利用できるサービス・リージョン・残量を確認して使います。[Azure for Students](https://azure.microsoft.com/en-us/pricing/offers/ms-azr-0170p/)

標準のチーム用ForkはPublicです。別途Privateでの運用を選ぶ場合は、PublicのForkを直接Privateへ変更できないため、先に運営と配布方法を決めます。

GitHubの **Environment** を使います。Publicリポジトリ、またはGitHub Proの個人アカウントが所有するPrivateリポジトリで進められます。Organization所有のPrivateリポジトリには、そのOrganizationのGitHub Team以上のプランが必要です。学生個人のProはOrganizationへは引き継がれません。[Environmentの利用条件](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)

## CodespacesでAzure MCPを使う準備（任意）

[devcontainer](../.devcontainer/devcontainer.json)に.NET 10とAzure CLI、[VS CodeのMCP設定](../.vscode/mcp.json)にAzure MCP `3.0.0-beta.48`を用意しています。

1. 既存Codespaceでは、更新した設定を取り込んでからコマンドパレットの **Codespaces: Rebuild Container** で環境を再構築します。新規作成では設定が最初から適用されます。
2. CodespacesのTerminalで`az login --use-device-code`を実行し、案内に従ってAzureへサインインします。`az account set --subscription '<使用するSubscription ID>'`で対象を選びます。
3. コマンドパレットで **MCP: List Servers → com.microsoft/azure → Start** を選びます。信頼の確認が出たら設定内容を確認して進み、Copilot Chatのツール一覧でAzure MCPが利用できることを確かめます。起動に失敗したら同じサーバーの **Show Output** でログを確認します。

この設定はCodespacesのVS Codeで使います。Copilot appで編集している場合も、[変更をCodespacesへ渡す手順](copilot-app.md#codespaces-transfer)で同じ設定を取り込み、上の準備を行えます。以降の手順で公開に必要な設定を整え、公開URLまで確認します。[Azure MCPの認証](https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/get-started/tools/visual-studio-code)・[VS CodeでのMCP管理](https://code.visualstudio.com/docs/agent-customization/mcp-servers)

## 1. テスト済みコンテナをGitHubへ保存する

1. チームのリポジトリのデフォルトブランチに、この教材の`.github/workflows/check.yml`と`Dockerfile`があることを確認します。Fork直後は、[チームのActionsを有効化](../README.md#enable-actions)してあることも確認します。公開したいアプリの変更が作業ブランチにある場合は、base repositoryとhead repositoryがチームのForkである確認済みのPRを、チームのデフォルトブランチへマージします。
2. GitHubの **Settings → Secrets and variables → Actions → Variables → New repository variable** で、`ENABLE_CONTAINER_PUBLISH`を値`true`で追加します。`ENABLE_AZURE_DEPLOY`はまだ設定しません。
3. **Actions → Check → Run workflow** で **チームのデフォルトブランチ** を選び、**初期設定用: Azureへ登録するOIDC接続情報だけ表示する**のチェックは外したまま実行します。
4. `check`と`publish`が成功したら、実行の **Summary → Tested container image** を開きます。`Tag`に表示される`ghcr.io/所有者/リポジトリ:タグ`を次節で使います。このイメージは本番コンテナでのブラウザテストを通っています。
5. リポジトリの **Packages**、または所有者のプロフィール／Organizationの **Packages** から、このコンテナパッケージを開きます。**Package settings → Change visibility → Public** にします。新規パッケージは通常Privateなので、初回に切り替えます。OrganizationのポリシーでPublicへ変更できない場合は、運営と所有者・公開方法を決めてから進めます。

この標準手順では、コンテナを誰でも取得できるようにします。一度PublicにしたパッケージはPrivateへ戻せないため、公開できるアプリコード・画面素材だけを含めてください。`.env`や秘密のキーはイメージへ入れません。非公開コードを配布するチームは、運営と非公開レジストリ・Azure側の取得認証を用意する別構成を選び、このPublic設定を使いません。[GHCRの公開範囲](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility)

## 2. Azure portalでContainer Appを作る

Azure portalで **Container Apps → Create** を開き、次を設定します。表示名やタブの並びが異なる場合は[公式の作成手順](https://learn.microsoft.com/en-us/azure/container-apps/quickstart-portal)も参照します。

初めて使うサブスクリプションでは、**Subscriptions → 対象のサブスクリプション → Resource providers**で`Microsoft.App`が登録済みか確認し、未登録なら **Register** を選びます。ほかのプロバイダーの未登録エラーが出た場合も、使うサービスについて同じ画面で登録します。登録の権限がない場合は運営に依頼します。[リソースプロバイダーの登録](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/resource-providers-and-types#azure-portal)

| 項目 | 設定 |
| --- | --- |
| Subscription / Resource group | 学生が利用するサブスクリプションと、チーム用リソースグループ |
| Container app name | チームのアプリ名 |
| Region / Environment | 利用可能なリージョンとContainer Apps環境。ワークロードプロファイルはConsumption |
| Deployment source / Image source | **Container image**を選び、Quickstart imageは使わず外部レジストリを選択 |
| Registry / Image | Registry serverは`ghcr.io`。Image and tagには手順1のTagから`ghcr.io/`を除いた`所有者/リポジトリ:タグ`。公開イメージなので取得用パスワードは不要 |
| CPU / Memory | 最初は0.5 vCPU / 1 GiBを目安に、アプリに合わせて選ぶ |
| Ingress | 有効、外部からのHTTPアクセスを許可、Target portは **8080** |
| Scale | Minimum replicas **0**、Maximum replicas **1**から開始 |
| Revision mode | **Single** |

画面の **Review + create** で内容を確認して作成します。作成後、必要なら **Containers**／**Scale**／**Revisions** の設定で上の値をそろえます。GHCRの公開イメージを使うレジストリ設定も`ghcr.io`に合わせます。[GHCRからのデプロイ](https://learn.microsoft.com/en-us/azure/container-apps/github-actions#deploy-images-from-non-acr-registries)

**Application URL** でアプリが開くことを確かめます。独自ドメインは必須ではありません。HTTPの入口にはAzureのHTTPS URLを使い、コンテナ自身は8080で待ち受けます。

Consumptionには月ごとの無料枠があり、0レプリカではコンテナのリソース消費課金は発生しません。ログ・通信・DB・外部AIなどの費用は別途確認します。[課金仕様](https://learn.microsoft.com/en-us/azure/container-apps/billing)

## 3. GitHub ActionsからAzureへ接続する

長期間使うクライアントシークレットを作らず、**OpenID Connect（OIDC）**で接続します。ここで作るIDは、GitHub Actionsがアプリを更新するためのものです。

1. GitHubの **Settings → Environments → New environment** で`production`を作ります。**Deployment branches and tags → Selected branches and tags → Add deployment branch or tag rule**で、Ref typeを **Branch**、名前にチームのデフォルトブランチ名（`codex/beginner-starter`）を入力して追加します。
2. **Actions → Check → Run workflow**で **チームのデフォルトブランチ** を選び、**初期設定用: Azureへ登録するOIDC接続情報だけ表示する**にチェックを入れて実行します。今回は`oidc-setup`だけが動きます。Azureへのログイン、コンテナの公開、デプロイは行いません。成功した実行の **Summary → Azure OIDC setup** にある **Issuer / Subject / Audience** を控えます。トークンそのものは表示されません。
3. Azure portalの **Managed Identities** で、チームのリソースグループに **User assigned managed identity** を作ります。Overviewにある **Client ID**、**Subscription ID** を控えます。**Tenant ID** は **Microsoft Entra ID → Overview** で確認できます。
4. そのIDの **Federated credentials → Add credential** を開き、シナリオは **Other issuer** を選びます。手順2の **Issuer / Subject / Audience** をそれぞれそのまま入力し、Nameは`github-production`などにして追加します。Subjectは大文字・小文字、数字のID、末尾の`environment:production`まで一致させます。
5. チーム用リソースグループの **Access control (IAM) → Add role assignment** で、このIDへ **Contributor** を割り当てます。割り当て先の範囲はそのチームのリソースグループです。権限不足の場合は、割り当て可能な運営・管理者に依頼します。

**2026年7月15日以降に作ったGitHubリポジトリでは、Subjectに所有者とリポジトリの数字のIDも含まれます。** 名前だけでSubjectを組み立てるとAzureへのログインに失敗するため、この教材では実際の値を表示してコピーします。旧形式のリポジトリでも同じ手順を使えます。[GitHubのSubject仕様](https://docs.github.com/en/actions/reference/security/oidc#immutable-subject-claims)・[Azureでの対応](https://learn.microsoft.com/en-us/entra/workload-id/workload-identities-github-immutable-subjects)・[Other issuerの設定](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-create-trust-user-assigned-managed-identity#other)

## 4. 公開を有効にする

GitHubの **Settings → Secrets and variables → Actions → Variables** に、次のRepository variablesを追加します。この表のIDは接続先の識別子であり、アプリのAPIキーやパスワードを入れる欄ではありません。

| 名前 | 値 |
| --- | --- |
| `AZURE_CLIENT_ID` | 手順3のUser assigned managed identityのClient ID |
| `AZURE_TENANT_ID` | AzureのTenant ID |
| `AZURE_SUBSCRIPTION_ID` | 使用するSubscription ID |
| `AZURE_RESOURCE_GROUP` | 手順2のリソースグループ名 |
| `AZURE_CONTAINER_APP_NAME` | 手順2のContainer App名 |
| `ENABLE_CONTAINER_PUBLISH` | `true`（手順1で設定済み） |
| `ENABLE_AZURE_DEPLOY` | `true` |

**Actions → Check → Run workflow → チームのデフォルトブランチ** で、**OIDC接続情報だけ表示するチェックを外して**実行します。`check` → `publish` → `deploy`が成功し、Summaryに公開URLが表示されれば初期設定は完了です。以降はチームのデフォルトブランチへのマージで同じ流れが動きます。

`deploy`は既存アプリへテスト済みイメージのdigestを指定して更新します。Single revision modeで新しいリビジョンが準備できるのを待ち、公開URLの`/api/health`を確認します。PRでのCI成功だけではデプロイ済みとは扱いません。次の公開URLの確認を行います。

## 5. 公開URLで確認し、更新する

成功した **Actions → Check → Summary → Azure Container Apps → URL**、またはAzure portalの **Application URL** を開きます。PLANの必須DoD、直接アクセス・再読み込み、使う場合はAPI・本物のログイン・共有DBを確認します。`/api/health`の成功は起動確認であり、企画全体の完成確認ではありません。

元のPRをマージ済みなら、まず[次の作業ブランチ](../README.md#after-merge)を準備してから、この節へ戻ります。公開URL・対象変更・日時・操作結果・未確認をルートの`PROGRESS.md`へ残します。記録を[保存・PR](../README.md#share)で共有し、[発表・終了](../README.md#finish)へ戻ります。

次のアプリ更新は **編集 → 確認 → commit・push → チーム内PR → マージ**です。マージ後のCheckで、`check`が本番コンテナをテストし、`publish`が再ビルドせずGHCRへ保存、`deploy`がそのdigestで既存Container Appを更新します。公開はチームのデフォルトブランチだけで動きます。

## 本番コンテナを手元で確認する（任意）

普段は`npm run dev`を使います。Dockerを用意済みのPC、またはDocker機能を含むCodespacesで公開前のコンテナを試せます。以前からのCodespaceでは必要に応じて **Codespaces: Rebuild Container** を使います。

手動previewやE2Eで4281を使っていたら止め、リポジトリのルートで実行します。

```sh
docker build -t student-hackathon .
docker run --rm -p 127.0.0.1:4281:8080 student-hackathon
```

PCは`http://127.0.0.1:4281`、Codespacesは **Ports → 4281 → Open in Browser**から画面と`/api/health`を確認します。ポートがなければ追加し、Privateのまま使えます。終了は **Ctrl+C**、変更後は再buildします。外部設定が必要ならrunへ`--env-file .env`を追加できます。CIはContainer Apps用の`linux/amd64`でビルド・テストします。手元での成功をAzureでの確認済みとはしません。

## API・DB・外部AIを使う場合

- APIは`server/api.js`へ追加し、画面は`/api/...`で呼びます。画面とAPIは同じサーバーが配信します。
- 開発中の`.env`は[.env.example](../.env.example)を参考に作り、教材の`PORT`・`HOST`を上書きしません。Azureには自動で移らないので、Container Appの[Secrets](https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets)と[環境変数](https://learn.microsoft.com/en-us/azure/container-apps/environment-variables)へ設定します。秘密のキーはサーバー側で使い、画面や`VITE_`変数には入れません。
- 共有・永続データには外部DB・ストレージを接続します。コンテナのファイルやメモリは永続保存先としません。必要な認証方式や外部AIの権利・利用枠・リージョンを確認し、公開URLで実際に操作します。
- `.env`やAzureのSecretsはCIにも継承されません。モックやテスト専用接続先を使うなら、その結果と実サービスの接続確認を区別してPROGRESSへ残します。CIへ値を渡す場合はActions Secrets等を使い、コンテナイメージに埋め込みません。

## うまくいかないとき

| 状況 | 確認すること |
| --- | --- |
| checkが失敗 | 最初の失敗ログと操作をCopilotへ渡す。失敗を省略して公開しない |
| publish／deployがSkipped | 有効化変数と実行ブランチ。OIDC表示用の実行なら公開・デプロイは行われない |
| GHCRへのpush／取得が失敗 | Packagesのポリシー、Public設定、イメージ名。既存パッケージはManage Actions accessでチームForkのWrite権限も確認 |
| Azureログインが失敗 | IDとFederated credentialsのIssuer・Subject・Audienceが実際の表示値と一致するか、Environment設定、設定反映待ち |
| productionを作れない | 管理権限と所有者のプラン。Private Organizationでは個人のProを代用できない |
| 起動しない | Azureのコンテナログ、環境変数、8080、DB・APIへの接続、Single revision設定 |
| 公開後に機能が動かない | 公開URLでの再現操作・結果・Actionsの実行URLをCopilotへ渡す |

## 利用を終えるとき

自動更新を止めるには`ENABLE_AZURE_DEPLOY=false`、イメージ公開も止めるなら`ENABLE_CONTAINER_PUBLISH=false`にします。**これだけではAzureのアプリやDBは停止・削除されません。**

継続利用するかチームで決め、不要なリソースはAzure portalから停止・削除します。チーム専用リソースグループを削除する場合は、残すDBやデータがないか確認します。残す場合はCost Managementで使用額・クレジット残量と担当者を確認します。

[READMEの発表・終了へ戻る](../README.md#finish) · [公式根拠と確認範囲](references.md)
