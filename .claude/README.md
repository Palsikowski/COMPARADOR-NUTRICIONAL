# Configuração do Claude Code neste projeto

## Subagentes (`.claude/agents/`)

| Agente | Para que serve |
|--------|----------------|
| `frontend-developer` | Desenvolvimento frontend completo (React / Vue / Angular), arquitetura de componentes, estado, testes, performance e acessibilidade WCAG 2.2. |

Os agentes são versionados junto com o repositório: quem clonar o projeto já os
tem disponíveis, sem instalação.

## Plugin: Claude HUD

[claude-hud](https://github.com/jarrodwatts/claude-hud) (MIT, por Jarrod Watts)
é uma statusline para o Claude Code que mostra, abaixo do input: modelo em uso,
caminho do projeto e branch git, uso do context window, limites de uso,
ferramentas em execução, subagentes ativos e progresso dos todos.

Ele já está marcado como habilitado para este projeto em
`.claude/settings.json` (`enabledPlugins`). Porém, **o marketplace precisa ser
registrado uma vez por máquina**: o Claude Code não aceita um marketplace de
rede declarado no escopo do projeto — só no escopo do usuário.

Cada pessoa da equipe roda, uma única vez, dentro de uma sessão do Claude Code:

```
/plugin marketplace add jarrodwatts/claude-hud
/plugin install claude-hud
/reload-plugins
```

E depois, para configurar a statusline:

```
/claude-hud:setup
```

Opcional — ajustar o que aparece na HUD (layout, idioma, linhas extras de
ferramentas / agentes / todos):

```
/claude-hud:configure
```

Pelo terminal, fora de uma sessão, os dois primeiros passos equivalem a:

```bash
claude plugin marketplace add jarrodwatts/claude-hud
claude plugin install claude-hud@claude-hud
```

Notas:
- Requer Node.js >= 18 (no Windows, Node.js LTS).
- Enquanto o marketplace não estiver registrado na máquina, a entrada em
  `enabledPlugins` é simplesmente ignorada — não quebra a sessão de quem não
  instalou.
