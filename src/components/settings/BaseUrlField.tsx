import { useState } from 'react'
import { IconEditOutline16 } from '../base/icons.js'
import { DEFAULT_API_ORIGIN, parseApiBaseUrl } from '../../services/api/client.js'
import { setApiBaseUrl, useSettings } from '../../services/settings.js'
import { useIsMobile } from '../../app/viewport.js'
import { IconButton } from '../base/IconButton.js'
import { useTranslate } from '../../i18n/index.js'
import styles from './Settings.module.css'

/** Base URL 编辑状态：输入框与移动端底部的「确定」按钮共用 */
export const useBaseUrlEditor = () => {
  const apiBaseUrl = useSettings((state) => state.apiBaseUrl)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const t = useTranslate()

  const submit = () => {
    const parsed = parseApiBaseUrl(value)
    if (!parsed.ok) {
      setError(t('apiBaseUrlInvalid'))
      return
    }
    // 与官方默认相同或清空时不持久化，运行时回退到 DEFAULT_API_ORIGIN
    setApiBaseUrl(parsed.value && parsed.value !== DEFAULT_API_ORIGIN ? parsed.value : null)
    setValue('')
    setError(null)
    setEditing(false)
  }

  return {
    apiBaseUrl,
    displayUrl: apiBaseUrl ?? DEFAULT_API_ORIGIN,
    editing,
    setEditing,
    value,
    setValue,
    error,
    setError,
    submit,
    showInput: editing,
  }
}

type BaseUrlEditor = ReturnType<typeof useBaseUrlEditor>

/** API Base URL：保存后显示当前生效地址，点编辑可修改；清空则回退官方默认 */
export const BaseUrlField = ({ editor }: { editor: BaseUrlEditor }) => {
  const t = useTranslate()
  const isMobile = useIsMobile()
  const {
    apiBaseUrl,
    displayUrl,
    editing,
    setEditing,
    value,
    setValue,
    error,
    setError,
    submit,
    showInput,
  } = editor

  return (
    <div className={styles.cell}>
      <div className={styles.apiKey}>
        <div className={styles.label}>{t('apiBaseUrlLabel')}</div>
        {!editing ? (
          <div className={styles.apiKeySaved}>
            <span className={styles.apiKeyMask}>{displayUrl}</span>
            <IconButton
              tone="primary"
              icon={<IconEditOutline16 />}
              tooltip={t('apiBaseUrlEdit')}
              onClick={() => {
                setValue(apiBaseUrl ?? DEFAULT_API_ORIGIN)
                setError(null)
                setEditing(true)
              }}
            />
          </div>
        ) : (
          <div className={styles.apiKeyInput}>
            <input
              type="url"
              placeholder={DEFAULT_API_ORIGIN}
              autoComplete="off"
              spellCheck={false}
              autoFocus={!isMobile || editing}
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                if (error) {
                  setError(null)
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  submit()
                }
              }}
              onBlur={() => {
                if (!value.trim()) {
                  setEditing(false)
                  setError(null)
                }
              }}
            />
            {!isMobile ? (
              <>
                <span className={styles.divider} />
                <button
                  type="button"
                  className={styles.confirm}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={submit}
                >
                  {t('confirm')}
                </button>
              </>
            ) : null}
          </div>
        )}
        {showInput && error ? <div className={styles.error}>{error}</div> : null}
      </div>
    </div>
  )
}

/** 移动端：编辑 Base URL 时在选项下方显示整行「确定」 */
export const BaseUrlConfirm = ({ editor: { showInput, submit } }: { editor: BaseUrlEditor }) => {
  const t = useTranslate()
  return showInput ? (
    <button
      type="button"
      className={styles.mobileConfirm}
      onMouseDown={(event) => event.preventDefault()}
      onClick={submit}
    >
      {t('confirm')}
    </button>
  ) : null
}
