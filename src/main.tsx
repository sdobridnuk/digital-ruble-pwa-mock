import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Screen = 'lock' | 'home' | 'account' | 'topup' | 'review' | 'otp' | 'result' | 'c2c' | 'c2c-review' | 'c2c-otp' | 'c2c-result' | 'withdraw' | 'withdraw-review' | 'withdraw-otp' | 'withdraw-result' | 'upk-scan' | 'upk-details' | 'upk-review' | 'upk-otp' | 'upk-result' | 'history' | 'feature' | 'feature-review' | 'feature-otp' | 'feature-result' | 'payments-home' | 'products' | 'profile' | 'ruble-account' | 'savings-account' | 'card-account';
type Outcome = 'success' | 'processing' | 'error';

type SessionOperation = {
  id: string;
  kind: 'income' | 'expense';
  title: string;
  subtitle: string;
  amount: number;
  createdAt: string;
};
type AccountTab = 'operations' | 'history';

type ClientMode = 'fl' | 'ip';
type FeatureKey =
  | 'autopay' | 'c2g-uin-fl' | 'c2g-details-fl' | 'notifications-fl' | 'documents-fl' | 'restrictions-fl' | 'consents-fl' | 'account-manage-fl'
  | 'b2b' | 'b2c-refund' | 'registry' | 'c2g-uin-ip' | 'c2g-details-ip' | 'notifications-ip' | 'documents-ip' | 'restrictions-ip' | 'consents-ip' | 'account-manage-ip';

type FeatureSpec = {
  key: FeatureKey;
  title: string;
  subtitle: string;
  icon: string;
  mode: ClientMode;
  monetary?: boolean;
  amount?: number;
  inputRows: Array<[string, string]>;
  reviewRows: Array<[string, string]>;
  resultTitle: string;
};

const FEATURE_SPECS: Record<FeatureKey, FeatureSpec> = {
  autopay: {
    key:'autopay', title:'Автопереводы', subtitle:'Однократные и ежемесячные', icon:'◷', mode:'fl', monetary:true, amount:1500,
    inputRows:[['Тип','Ежемесячный перевод'],['Получатель','Леонид Леонидович Х.'],['Сумма','1 500,00 ₽'],['Дата','15 число каждого месяца'],['Назначение','Регулярный перевод']],
    reviewRows:[['Получатель','Леонид Леонидович Х.'],['Сумма','1 500,00 ₽'],['Периодичность','Ежемесячно, 15 числа'],['Назначение','Регулярный перевод'],['Счёт списания','Цифровой рубль • 0340']],
    resultTitle:'Автоперевод создан'
  },
  'c2g-uin-fl': {
    key:'c2g-uin-fl', title:'Оплата по УИН', subtitle:'Платёж в бюджет', icon:'⌁', mode:'fl', monetary:true, amount:1850,
    inputRows:[['УИН','18810199260701123456'],['Плательщик','Сергей Д.'],['Счёт списания','Цифровой рубль • 0340']],
    reviewRows:[['УИН','18810199260701123456'],['Получатель','УФК по г. Москве'],['Назначение','Государственная пошлина'],['КБК','188 1 08 07010 01 1050 110'],['ОКТМО','45382000'],['Сумма','1 850,00 ₽']],
    resultTitle:'Платёж выполнен'
  },
  'c2g-details-fl': {
    key:'c2g-details-fl', title:'По реквизитам в бюджет', subtitle:'Свободные реквизиты C2G', icon:'≡', mode:'fl', monetary:true, amount:3200,
    inputRows:[['Получатель','УФК по г. Москве'],['ИНН','7700000000'],['КПП','770001001'],['БИК','044525000'],['Сумма','3 200,00 ₽'],['Назначение','Оплата услуги']],
    reviewRows:[['Получатель','УФК по г. Москве'],['ИНН / КПП','7700000000 / 770001001'],['БИК','044525000'],['КБК','00000000000000000130'],['ОКТМО','45382000'],['Сумма','3 200,00 ₽'],['Назначение','Оплата услуги']],
    resultTitle:'Платёж выполнен'
  },
  'notifications-fl': {
    key:'notifications-fl', title:'Уведомления', subtitle:'Сообщения платформы ЦР', icon:'◉', mode:'fl',
    inputRows:[['Новые','2'],['Последнее','Изменение баланса · сегодня, 14:32'],['Статус счёта','Активен']],
    reviewRows:[['Изменение баланса','Пополнение +1 209,67 ₽'],['Операция','Перевод выполнен'],['Системное сообщение','Ограничений по счёту нет']],
    resultTitle:'Уведомления просмотрены'
  },
  'documents-fl': {
    key:'documents-fl', title:'Справки и документы', subtitle:'Запрос PDF', icon:'▤', mode:'fl',
    inputRows:[['Документ','Справка об операциях'],['Период','01.08.2026 — 23.08.2026'],['Формат','PDF']],
    reviewRows:[['Документ','Справка об операциях'],['Период','01.08.2026 — 23.08.2026'],['Формат','PDF'],['Получение','В приложении после формирования']],
    resultTitle:'Запрос документа отправлен'
  },
  'restrictions-fl': {
    key:'restrictions-fl', title:'Ограничения', subtitle:'Аресты и резервирование', icon:'!', mode:'fl',
    inputRows:[['Общий остаток','24 780,23 ₽'],['Заблокировано','0,00 ₽'],['Зарезервировано','0,00 ₽']],
    reviewRows:[['Статус','Ограничений нет'],['Доступно','24 780,23 ₽'],['Заблокировано','0,00 ₽'],['Зарезервировано','0,00 ₽']],
    resultTitle:'Информация актуальна'
  },
  'consents-fl': {
    key:'consents-fl', title:'Согласия', subtitle:'Предоставление и отзыв', icon:'✓', mode:'fl',
    inputRows:[['Согласие','Оплата с привязанного счёта'],['Получатель','ТСП «Город»'],['Статус','Не предоставлено']],
    reviewRows:[['Действие','Предоставить согласие'],['Получатель','ТСП «Город»'],['Доступ','Оплата C2B с привязанного СЦР'],['Срок','До отзыва']],
    resultTitle:'Согласие предоставлено'
  },
  'account-manage-fl': {
    key:'account-manage-fl', title:'Счёт и доступ', subtitle:'Реквизиты, статус, сертификат', icon:'⚙', mode:'fl',
    inputRows:[['Номер счёта','40817 810 … 0034 0'],['UUID','6f3a2e1b…e5f6a7b'],['Статус','Активен'],['Договор','ДЦР-2026-0001842'],['Сертификат','Действует']],
    reviewRows:[['Доступные действия','Обновить баланс'],['','Приостановить / возобновить доступ'],['','Закрыть счёт'],['','Отозвать сертификат'],['','Изменить телефон / e-mail']],
    resultTitle:'Данные счёта обновлены'
  },

  b2b: {
    key:'b2b', title:'Перевод бизнесу', subtitle:'B2B по реквизитам', icon:'⇄', mode:'ip', monetary:true, amount:12500,
    inputRows:[['Получатель','ООО «Поставщик»'],['ИНН','7708123456'],['Счёт ЦР получателя','40817 810 … 0098 7'],['Сумма','12 500,00 ₽'],['Назначение','Оплата по счёту № 84']],
    reviewRows:[['Получатель','ООО «Поставщик»'],['ИНН','7708123456'],['Счёт ЦР','40817 810 … 0098 7'],['Комиссия','0,00 ₽'],['Сумма','12 500,00 ₽'],['Назначение','Оплата по счёту № 84']],
    resultTitle:'Перевод выполнен'
  },
  'b2c-refund': {
    key:'b2c-refund', title:'Возврат покупателю', subtitle:'B2C по исходной покупке', icon:'↶', mode:'ip', monetary:true, amount:1290,
    inputRows:[['Исходная операция','C2B · 1 290,00 ₽ · Кофейня «Город»'],['UUID операции','4a7d09cf…71d9ac'],['Получатель','Леонид Леонидович Х.'],['Сумма возврата','1 290,00 ₽']],
    reviewRows:[['Исходная операция','C2B · 1 290,00 ₽'],['Получатель','Леонид Леонидович Х.'],['Сумма возврата','1 290,00 ₽'],['Остаток возврата','0,00 ₽ после операции']],
    resultTitle:'Возврат выполнен'
  },
  registry: {
    key:'registry', title:'Выплаты по реестру', subtitle:'B2C нескольким получателям', icon:'☷', mode:'ip', monetary:true, amount:18600,
    inputRows:[['Файл','salary_august_2026.csv'],['Записей','3'],['Сумма реестра','18 600,00 ₽'],['Назначение','Выплаты по реестру']],
    reviewRows:[['Записей','3'],['К исполнению','3'],['Сумма','18 600,00 ₽'],['Контроль','Формат и реквизиты проверены'],['Результат','Будет доступен по каждой записи']],
    resultTitle:'Реестр принят в обработку'
  },
  'c2g-uin-ip': {
    key:'c2g-uin-ip', title:'Оплата по УИН', subtitle:'C2G для ИП', icon:'⌁', mode:'ip', monetary:true, amount:6400,
    inputRows:[['УИН','18210102010011000110'],['Плательщик','ИП Сергей Д.'],['ИНН','770123456789']],
    reviewRows:[['УИН','18210102010011000110'],['Плательщик','ИП Сергей Д.'],['Получатель','УФК по г. Москве'],['КБК','182 1 01 02010 01 1000 110'],['ОКТМО','45382000'],['Сумма','6 400,00 ₽']],
    resultTitle:'Платёж выполнен'
  },
  'c2g-details-ip': {
    key:'c2g-details-ip', title:'В бюджет по реквизитам', subtitle:'C2G для ИП', icon:'≡', mode:'ip', monetary:true, amount:8700,
    inputRows:[['Получатель','УФК по г. Москве'],['ИНН / КПП','7700000000 / 770001001'],['БИК','044525000'],['Сумма','8 700,00 ₽'],['Назначение','Налоговый платёж']],
    reviewRows:[['Получатель','УФК по г. Москве'],['ИНН / КПП','7700000000 / 770001001'],['БИК','044525000'],['КБК','182 1 05 01011 01 1000 110'],['ОКТМО','45382000'],['Сумма','8 700,00 ₽'],['Назначение','Налоговый платёж']],
    resultTitle:'Платёж выполнен'
  },
  'notifications-ip': {
    key:'notifications-ip', title:'Уведомления', subtitle:'Операции и решения платформы', icon:'◉', mode:'ip',
    inputRows:[['Новые','3'],['Последнее','Реестр принят в обработку'],['Статус счёта','Активен']],
    reviewRows:[['Реестр','3 записи приняты'],['B2B','Перевод выполнен'],['Ограничения','Отсутствуют']],
    resultTitle:'Уведомления просмотрены'
  },
  'documents-ip': {
    key:'documents-ip', title:'Справки и документы', subtitle:'PDF для ИП', icon:'▤', mode:'ip',
    inputRows:[['Документ','Справка об операциях ИП'],['Период','01.08.2026 — 23.08.2026'],['Формат','PDF']],
    reviewRows:[['Документ','Справка об операциях ИП'],['Период','01.08.2026 — 23.08.2026'],['Формат','PDF'],['Получение','В приложении после формирования']],
    resultTitle:'Запрос документа отправлен'
  },
  'restrictions-ip': {
    key:'restrictions-ip', title:'Ограничения', subtitle:'Аресты, блокировки, резерв', icon:'!', mode:'ip',
    inputRows:[['Общий остаток','63 500,00 ₽'],['Заблокировано','5 000,00 ₽'],['Зарезервировано','12 500,00 ₽']],
    reviewRows:[['Доступно','46 000,00 ₽'],['Заблокировано','5 000,00 ₽'],['Зарезервировано','12 500,00 ₽'],['Основание','Демо-ограничение № 184']],
    resultTitle:'Информация актуальна'
  },
  'consents-ip': {
    key:'consents-ip', title:'Согласия', subtitle:'Операции от имени ИП', icon:'✓', mode:'ip',
    inputRows:[['Согласие','Возврат B2C'],['Финансовый посредник','Текущий банк'],['Статус','Действует']],
    reviewRows:[['Действие','Управление согласием'],['Тип','Возврат B2C / операции от имени клиента'],['Статус','Действует'],['Доступно','Отозвать или предоставить новое']],
    resultTitle:'Согласие обновлено'
  },
  'account-manage-ip': {
    key:'account-manage-ip', title:'Счёт ИП и доступ', subtitle:'Реквизиты, статус, сертификат', icon:'⚙', mode:'ip',
    inputRows:[['Пользователь','ИП Сергей Д.'],['ОГРНИП','326770000123456'],['ИНН','770123456789'],['Телефон','+7 916 •••-••-34'],['Статус счёта','Активен']],
    reviewRows:[['Номер счёта ЦР','40817 810 … 0088 4'],['UUID','8c012b5a…a0d9e1c'],['Договор','ДЦР-ИП-2026-000481'],['Сертификат','Действует'],['Действия','Изменить реквизиты / статус / доступ']],
    resultTitle:'Данные ИП обновлены'
  }
};


type StoredState = { balance: number };

const money = (value: number) => new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value) + ' ₽';

const DR_ID_FULL = '6f3a2e1b-55d4-4c21-8f7a-9b6d0e3c7a1f-34b8c1d2e5f6a7b9c2';
const DR_ID = '6f3a2e1b…e5f6a7b';
const RUB_ACCOUNT = '40817810400000123456';
const RUB_ACCOUNT_MASKED = '4081 7810 … 1234 56';
const SAV_ACCOUNT_MASKED = '4081 7810 … 6543 21';
const USD_ACCOUNT_MASKED = '4081 7840 … 2222 33';
const EUR_ACCOUNT_MASKED = '4081 7978 … 3333 44';
const CARD_MASKED = '2200 15… …1234';

function App() {
  const [screen, setScreen] = useState<Screen>('lock');
  const [balance, setBalance] = useState(() => {
    try {
      const raw = localStorage.getItem('dr-demo-state');
      if (!raw) return 24780.23;
      return (JSON.parse(raw) as StoredState).balance ?? 24780.23;
    } catch {
      return 45120.83;
    }
  });
  const [amount, setAmount] = useState('1209.67');
  const [bankAccount, setBankAccount] = useState(RUB_ACCOUNT_MASKED);
  const [outcome, setOutcome] = useState<Outcome>('success');
  const [showMock, setShowMock] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [otp, setOtp] = useState('');
  const [processingChecks, setProcessingChecks] = useState(0);
  const [recipient, setRecipient] = useState('+7 916 555-12-34');
  const [transferAmount, setTransferAmount] = useState('2500.00');
  const [message, setMessage] = useState('За обед');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Обращаемся в банк');
  const [withdrawAmount, setWithdrawAmount] = useState('5000.00');
  const [withdrawDestination, setWithdrawDestination] = useState(RUB_ACCOUNT_MASKED);
  const [rubleBalance, setRubleBalance] = useState(42420.50);
  const [savingsBalanceState, setSavingsBalanceState] = useState(18500.00);
  const cardBalance = rubleBalance;

  const [upkAmount] = useState(1290.00);
  const [sessionOperations, setSessionOperations] = useState<SessionOperation[]>([]);
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [clientMode, setClientMode] = useState<ClientMode>('fl');
  const [currentFeature, setCurrentFeature] = useState<FeatureKey>('autopay');

  const addSessionOperation = (op: Omit<SessionOperation, 'id' | 'createdAt'>) => {
    const now = new Date();
    setSessionOperations(prev => [{
      ...op,
      id: `${now.getTime()}-${Math.random().toString(16).slice(2)}`,
      createdAt: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    }, ...prev]);
  };



  useEffect(() => {
    localStorage.setItem('dr-demo-state', JSON.stringify({ balance }));
  }, [balance]);

  const amountNumber = useMemo(() => Number(amount.replace(',', '.')) || 0, [amount]);
  const valid = amountNumber > 0 && bankAccount.length > 0;
  const transferAmountNumber = useMemo(() => Number(transferAmount.replace(',', '.')) || 0, [transferAmount]);
  const transferValid = recipient.trim().length > 4 && transferAmountNumber > 0 && transferAmountNumber <= balance && message.length <= 210;

  const resetDemo = () => {
    setBalance(24780.23);
    setAmount('1209.67');
    setOutcome('success');
    setOtp('');
    setProcessingChecks(0);
    setShowDetails(false);
    setRecipient('+7 916 555-12-34');
    setTransferAmount('2500.00');
    setMessage('За обед');
    setLoading(false);
    setScreen('home');
  };

  const goBack = () => {
    const prev: Partial<Record<Screen, Screen>> = {
      lock: 'lock',
      home: 'home',
      account: 'home',
      topup: 'account',
      review: 'topup',
      otp: 'review',
      result: 'account',
      c2c: 'account',
      'c2c-review': 'c2c',
      'c2c-otp': 'c2c-review',
      'c2c-result': 'account',
      withdraw: 'account',
      'withdraw-review': 'withdraw',
      'withdraw-otp': 'withdraw-review',
      'withdraw-result': 'account',
      'upk-scan': 'account',
      'upk-details': 'upk-scan',
      'upk-review': 'upk-details',
      'upk-otp': 'upk-review',
      'upk-result': 'account',
      history: 'home',
      feature: 'account',
      'feature-review': 'feature',
      'feature-otp': 'feature-review',
      'feature-result': 'account',
      'payments-home': 'home',
      products: 'home',
      profile: 'home',
      'ruble-account': 'home',
      'savings-account': 'home',
      'card-account': 'home',
    };
    setScreen(prev[screen] ?? 'home');
  };

  const withBankSpinner = (text: string, action: () => void) => {
    setLoadingText(text);
    setLoading(true);
    window.setTimeout(() => { setLoading(false); action(); }, 1500);
  };

  const complete = () => {
    if (outcome === 'success') setBalance((b) => b + amountNumber);
    setProcessingChecks(0);
    setShowDetails(false);
    setScreen('result');
  };

  const completeTransfer = () => {
    if (outcome === 'success') {
      setBalance((b) => Math.max(0, b - transferAmountNumber));
      addSessionOperation({
        kind: 'expense',
        title: 'Перевод',
        subtitle: `Леонид Леонидович Х. · ${recipient}`,
        amount: transferAmountNumber
      });
    }
    setProcessingChecks(0);
    setShowDetails(false);
    setScreen('c2c-result');
  };

  const withdrawAmountNumber = Number(withdrawAmount.replace(',', '.')) || 0;
  const withdrawValid = withdrawAmountNumber > 0 && withdrawAmountNumber <= balance;

  const completeWithdraw = () => {
    if (outcome === 'success') {
      setBalance((b) => Math.max(0, b - withdrawAmountNumber));
      setRubleBalance((b) => b + withdrawAmountNumber);
      addSessionOperation({
        kind: 'expense',
        title: 'Вывод средств',
        subtitle: `На ${withdrawDestination}`,
        amount: withdrawAmountNumber
      });
    }
    setScreen('withdraw-result');
  };

  const completeUpk = () => {
    if (outcome === 'success') {
      setBalance((b) => Math.max(0, b - upkAmount));
      addSessionOperation({
        kind: 'expense',
        title: 'Оплата по УПК',
        subtitle: 'Кофейня «Город» · Заказ № 1842',
        amount: upkAmount
      });
    }
    setScreen('upk-result');
  };

  const refreshProcessing = () => {
    const next = processingChecks + 1;
    setProcessingChecks(next);
    if (next >= 2) {
      setBalance((b) => b + amountNumber);
      setOutcome('success');
    }
  };



  const enterLoginDigit = (digit: string) => {
    setLoginError(false);
    setLoginPin((p) => {
      const next = (p + digit).slice(0, 4);
      if (next.length === 4) {
        window.setTimeout(() => {
          // Demo PIN: any four digits.
          setScreen('home');
          setLoginPin('');
        }, 180);
      }
      return next;
    });
  };

  const useFingerprint = () => {
    setLoginError(false);
    withBankSpinner('Проверяем отпечаток пальца', () => {
      setLoginPin('');
      setScreen('home');
    });
  };

  const openFeature = (key: FeatureKey) => {
    setCurrentFeature(key);
    setScreen('feature');
  };

  const completeFeature = () => {
    const spec = FEATURE_SPECS[currentFeature];
    if (outcome === 'success' && spec.monetary && spec.amount) {
      setBalance((b) => Math.max(0, b - spec.amount!));
      addSessionOperation({
        kind: 'expense',
        title: spec.title,
        subtitle: spec.subtitle,
        amount: spec.amount
      });
    }
    setScreen('feature-result');
  };

  const refreshTransferProcessing = () => {
    const next = processingChecks + 1;
    setProcessingChecks(next);
    if (next >= 2) {
      setBalance((b) => Math.max(0, b - transferAmountNumber));
      setOutcome('success');
    }
  };

  return (
    <div className="page-shell">
      <div className="phone">
        <StatusBar />
        {screen === 'lock' && <LockScreen pin={loginPin} error={loginError} onDigit={enterLoginDigit} onDelete={() => setLoginPin((p)=>p.slice(0,-1))} onFingerprint={useFingerprint} />}
        {screen === 'home' && <HomeScreen balance={balance} rubleBalance={rubleBalance} onOpen={() => setScreen('account')} onRuble={() => setScreen('ruble-account')} onSavings={() => setScreen('savings-account')} onCard={() => setScreen('card-account')} />}
        {screen === 'account' && <AccountScreen balance={balance} mode={clientMode} onMode={setClientMode} onBack={goBack} onTopUp={() => setScreen('topup')} onTransfer={() => setScreen('c2c')} onWithdraw={() => setScreen('withdraw')} onUpk={() => setScreen('upk-scan')} onFeature={openFeature} />}
        {screen === 'topup' && (
          <TopUpScreen
            balance={balance}
            amount={amount}
            bankAccount={bankAccount}
            valid={valid}
            onAmount={setAmount}
            onBankAccount={setBankAccount}
            onBack={goBack}
            onContinue={() => valid && setScreen('review')}
          />
        )}
        {screen === 'review' && (
          <ReviewScreen
            balance={balance}
            amount={amountNumber}
            bankAccount={bankAccount}
            onBack={goBack}
            onConfirm={() => { setOtp(''); setScreen('otp'); }}
          />
        )}
        {screen === 'otp' && (
          <OtpScreen
            otp={otp}
            onOtp={setOtp}
            onBack={goBack}
            onConfirm={() => withBankSpinner('Отправляем запрос на пополнение', complete)}
          />
        )}
        {screen === 'result' && (
          <ResultScreen
            outcome={outcome}
            amount={amountNumber}
            balance={balance}
            showDetails={showDetails}
            processingChecks={processingChecks}
            onDetails={() => setShowDetails((v) => !v)}
            onRefresh={refreshProcessing}
            onClose={() => setScreen('account')}
            onRetry={() => setScreen('topup')}
          />
        )}
        {screen === 'c2c' && (
          <TransferScreen
            balance={balance}
            recipient={recipient}
            amount={transferAmount}
            message={message}
            valid={transferValid}
            onRecipient={setRecipient}
            onAmount={setTransferAmount}
            onMessage={setMessage}
            onBack={goBack}
            onContinue={() => transferValid && setScreen('c2c-review')}
          />
        )}
        {screen === 'c2c-review' && (
          <TransferReviewScreen
            recipient={recipient}
            amount={transferAmountNumber}
            message={message}
            onBack={goBack}
            onConfirm={() => { setOtp(''); setScreen('c2c-otp'); }}
          />
        )}
        {screen === 'c2c-otp' && (
          <OtpScreen
            otp={otp}
            onOtp={setOtp}
            onBack={goBack}
            onConfirm={() => withBankSpinner('Отправляем цифровые рубли', completeTransfer)}
            operationText="перевода цифровых рублей"
          />
        )}
        {screen === 'c2c-result' && (
          <TransferResultScreen
            outcome={outcome}
            amount={transferAmountNumber}
            recipient={recipient}
            showDetails={showDetails}
            processingChecks={processingChecks}
            onDetails={() => setShowDetails((v) => !v)}
            onRefresh={refreshTransferProcessing}
            onClose={() => setScreen('account')}
            onRetry={() => setScreen('c2c')}
          />
        )}

        {screen === 'withdraw' && <WithdrawScreen balance={balance} amount={withdrawAmount} destination={withdrawDestination} onAmount={setWithdrawAmount} onDestination={setWithdrawDestination} onBack={goBack} onContinue={() => withdrawValid && setScreen('withdraw-review')} />}
        {screen === 'withdraw-review' && <WithdrawReviewScreen amount={withdrawAmountNumber} destination={withdrawDestination} onBack={goBack} onConfirm={() => { setOtp(''); setScreen('withdraw-otp'); }} />}
        {screen === 'withdraw-otp' && <OtpScreen otp={otp} onOtp={setOtp} onBack={goBack} onConfirm={() => withBankSpinner('Выводим цифровые рубли', completeWithdraw)} operationText="вывода цифровых рублей" />}
        {screen === 'withdraw-result' && <SimpleResult title={outcome === 'success' ? 'Средства выведены' : outcome === 'processing' ? 'Операция выполняется' : 'Не удалось вывести средства'} amount={withdrawAmountNumber} success={outcome === 'success'} onClose={() => setScreen('account')} />}
        {screen === 'upk-scan' && <UpkScanScreen onBack={goBack} onScanned={() => setScreen('upk-details')} />}
        {screen === 'upk-details' && <UpkDetailsScreen balance={balance} amount={upkAmount} onBack={goBack} onContinue={() => setScreen('upk-review')} />}
        {screen === 'upk-review' && <UpkReviewScreen amount={upkAmount} onBack={goBack} onConfirm={() => { setOtp(''); setScreen('upk-otp'); }} />}
        {screen === 'upk-otp' && <OtpScreen otp={otp} onOtp={setOtp} onBack={goBack} onConfirm={() => withBankSpinner('Оплачиваем цифровыми рублями', completeUpk)} operationText="платежа цифровыми рублями" />}
        {screen === 'upk-result' && <SimpleResult title={outcome === 'success' ? 'Платёж выполнен' : outcome === 'processing' ? 'Платёж выполняется' : 'Не удалось выполнить платёж'} amount={upkAmount} success={outcome === 'success'} onClose={() => setScreen('account')} />}
        {screen === 'history' && <HistoryScreen operations={sessionOperations} onBack={() => setScreen('home')} />}

        {screen === 'feature' && <FeatureScreen spec={FEATURE_SPECS[currentFeature]} onBack={goBack} onContinue={() => setScreen('feature-review')} />}
        {screen === 'feature-review' && <FeatureReviewScreen spec={FEATURE_SPECS[currentFeature]} onBack={goBack} onConfirm={() => FEATURE_SPECS[currentFeature].monetary ? (setOtp(''), setScreen('feature-otp')) : withBankSpinner('Обращаемся к платформе цифрового рубля', completeFeature)} />}
        {screen === 'feature-otp' && <OtpScreen otp={otp} onOtp={setOtp} onBack={goBack} onConfirm={() => withBankSpinner('Выполняем операцию с цифровыми рублями', completeFeature)} operationText={FEATURE_SPECS[currentFeature].title.toLowerCase()} />}
        {screen === 'feature-result' && <SimpleResult title={outcome === 'success' ? FEATURE_SPECS[currentFeature].resultTitle : outcome === 'processing' ? 'Операция выполняется' : 'Операция не выполнена'} amount={FEATURE_SPECS[currentFeature].amount || 0} success={outcome === 'success'} onClose={() => setScreen('account')} />}


        {screen === 'payments-home' && <PaymentsHomeScreen onDigital={() => setScreen('account')} onBetween={() => setScreen('ruble-account')} onUpk={() => setScreen('upk-scan')} />}
        {screen === 'products' && <ProductsScreen balance={balance} rubleBalance={rubleBalance} savingsBalance={savingsBalanceState} onRuble={() => setScreen('ruble-account')} onSavings={() => setScreen('savings-account')} onCard={() => setScreen('card-account')} onDigital={() => setScreen('account')} />}
        {screen === 'profile' && <ProfileScreen onDigital={() => setScreen('account')} />}
        {screen === 'ruble-account' && <StandardAccountScreen kind="ruble" balance={rubleBalance} onBack={() => setScreen('home')} onHistory={() => setScreen('history')} onTransfer={() => setScreen('payments-home')} />}
        {screen === 'savings-account' && <StandardAccountScreen kind="savings" balance={savingsBalanceState} onBack={() => setScreen('home')} onHistory={() => setScreen('history')} onTransfer={() => setScreen('payments-home')} />}
        {screen === 'card-account' && <StandardAccountScreen kind="card" balance={cardBalance} onBack={() => setScreen('home')} onHistory={() => setScreen('history')} onTransfer={() => setScreen('payments-home')} />}

        {screen !== 'lock' && <BottomNav
          active={screen === 'home' ? 'home' : screen === 'history' ? 'history' : screen === 'products' ? 'products' : screen === 'profile' ? 'profile' : 'payments'}
          onHome={() => setScreen('home')}
          onPayments={() => setScreen('payments-home')}
          onHistory={() => setScreen('history')}
          onProducts={() => setScreen('products')}
          onProfile={() => setScreen('profile')}
        />}

        {loading && <BankSpinner text={loadingText} />}
      </div>

      <button className="mock-fab" onClick={() => setShowMock((v) => !v)}>MOCK</button>
      {showMock && (
        <div className="mock-panel">
          <div className="mock-title">Ответ платформы</div>
          <label><input type="radio" checked={outcome === 'success'} onChange={() => setOutcome('success')} /> Успешно</label>
          <label><input type="radio" checked={outcome === 'processing'} onChange={() => setOutcome('processing')} /> В процессе</label>
          <label><input type="radio" checked={outcome === 'error'} onChange={() => setOutcome('error')} /> Ошибка</label>
          <div className="mock-hint">Для «В процессе» статус станет успешным после второго нажатия «Обновить».</div>
          <button onClick={resetDemo}>Сбросить demo</button>
        </div>
      )}
    </div>
  );
}

function StatusBar() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString('ru-RU', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return <div className="statusbar"><span>{time}</span><span>●●●&nbsp;&nbsp;Wi‑Fi&nbsp;&nbsp;▰</span></div>;
}

function Header({ title, back = false, onBack }: { title: string; back?: boolean; onBack?: () => void }) {
  return (
    <div className="header">
      <div className="header-side">{back && <button className="icon-btn" onClick={onBack}>‹</button>}</div>
      <div className="header-title">{title}</div>
      <div className="header-side right">⋮</div>
    </div>
  );
}



function StandardAccountScreen({
  kind, balance, onBack, onHistory, onTransfer
}: {
  kind:'ruble'|'savings'|'card'; balance:number; onBack:()=>void; onHistory:()=>void; onTransfer:()=>void;
}) {
  const meta = kind==='ruble' ? {
    title:'Рублёвый счёт', name:'Текущий счёт', number:RUB_ACCOUNT_MASKED, icon:'₽', accent:'blue',
    info:[['Тип счёта','Текущий рублёвый'],['Статус','● Активен'],['Номер счёта',RUB_ACCOUNT_MASKED],['Доступно',money(balance)]]
  } : kind==='savings' ? {
    title:'Накопительный счёт', name:'Накопления', number:SAV_ACCOUNT_MASKED, icon:'%', accent:'green',
    info:[['Ставка','12,5% годовых'],['Начислено в этом месяце','1 250,00 ₽'],['Номер счёта',SAV_ACCOUNT_MASKED],['Доступно',money(balance)]]
  } : {
    title:'Карта •••• 1234', name:'Дебетовая карта', number:CARD_MASKED, icon:'▰', accent:'violet',
    info:[['Платёжная система','МИР'],['Номер карты',CARD_MASKED],['Привязанный счёт',RUB_ACCOUNT_MASKED],['Доступно',money(balance)]]
  };
  return <main className="screen standard-account-screen">
    <Header title={meta.title} back onBack={onBack}/>
    <section className={`standard-account-card ${meta.accent}`}>
      <div className="standard-account-icon">{meta.icon}</div>
      <span>{meta.name}</span>
      <strong>{money(balance)}</strong>
      <small>{meta.number}</small>
    </section>
    <section className="standard-actions">
      <button onClick={onTransfer}><i>↗</i><span>Перевести</span></button>
      <button onClick={onTransfer}><i>＋</i><span>Пополнить</span></button>
      <button onClick={onTransfer}><i>⇄</i><span>Между счетами</span></button>
      <button onClick={onHistory}><i>◷</i><span>История</span></button>
    </section>
    <section className="white-panel operation-list">
      <ActionItem icon="▤" label="Реквизиты" subtitle="Скопировать или отправить"/>
      <ActionItem icon="⚙" label="Настройки" subtitle={kind==='card'?'Лимиты, уведомления, блокировка':'Название, уведомления и параметры'}/>
      {kind==='savings' && <ActionItem icon="%" label="Условия начисления" subtitle="Ставка, даты и начисленные проценты"/>}
      {kind==='card' && <ActionItem icon="▣" label="Оплата телефоном" subtitle="Настройки бесконтактной оплаты"/>}
    </section>
    <section className="white-panel compact-info">
      {meta.info.map(([l,v],i)=><InfoRow key={i} label={l} value={v}/>)}
    </section>
  </main>;
}

function PaymentsHomeScreen({onDigital,onBetween,onUpk}:{onDigital:()=>void;onBetween:()=>void;onUpk:()=>void}) {
  return <main className="screen hub-screen">
    <Header title="Платежи"/>
    <div className="hub-search">⌕ <span>Поиск платежа, получателя или услуги</span></div>
    <section className="hub-grid">
      <button onClick={onBetween}><i>⇄</i><strong>Между своими</strong><span>Счета и карты</span></button>
      <button onClick={onDigital}><i>₽</i><strong>Цифровой рубль</strong><span>Переводы и платежи</span></button>
      <button onClick={onUpk}><i>⌗</i><strong>QR / УПК</strong><span>Сканировать код</span></button>
      <button><i>☎</i><strong>По телефону</strong><span>СБП и переводы</span></button>
    </section>
    <div className="operation-section-title">Оплатить</div>
    <section className="white-panel operation-list">
      <ActionItem icon="▣" label="Мобильная связь" subtitle="По номеру телефона"/>
      <ActionItem icon="⌂" label="ЖКХ" subtitle="Квартплата, электричество, вода"/>
      <ActionItem icon="⚑" label="Налоги, штрафы, пошлины" subtitle="Госуслуги и бюджетные платежи"/>
      <ActionItem icon="≡" label="По реквизитам" subtitle="Счёт, БИК, ИНН"/>
      <ActionItem icon="◷" label="Автоплатежи" subtitle="Регулярные платежи и переводы"/>
    </section>
  </main>;
}

function ProductsScreen({balance,rubleBalance,savingsBalance,onRuble,onSavings,onCard,onDigital}:{
  balance:number;rubleBalance:number;savingsBalance:number;onRuble:()=>void;onSavings:()=>void;onCard:()=>void;onDigital:()=>void;
}) {
  return <main className="screen hub-screen">
    <Header title="Продукты"/>
    <div className="operation-section-title">Счета и карты</div>
    <section className="product-catalog">
      <button onClick={onRuble}><i className="blue">₽</i><div><strong>Рублёвый счёт</strong><span>{RUB_ACCOUNT_MASKED}</span></div><b>{money(rubleBalance)}</b></button>
      <button onClick={onSavings}><i className="green">%</i><div><strong>Накопительный счёт</strong><span>12,5% годовых</span></div><b>{money(savingsBalance)}</b></button>
      <button onClick={onCard}><i className="violet">▰</i><div><strong>Карта •••• 1234</strong><span>{CARD_MASKED}</span></div><b>{money(rubleBalance)}</b></button>
      <button onClick={onDigital}><i className="digital">₽</i><div><strong>Цифровой рубль</strong><span>• 0340</span></div><b>{money(balance)}</b></button>
    </section>
    <div className="operation-section-title">Открыть новый продукт</div>
    <section className="hub-grid two">
      <button><i>＋</i><strong>Счёт</strong><span>Рублёвый или валютный</span></button>
      <button><i>%</i><strong>Накопления</strong><span>Вклад или накопительный</span></button>
    </section>
  </main>;
}

function ProfileScreen({onDigital}:{onDigital:()=>void}) {
  return <main className="screen hub-screen">
    <Header title="Профиль"/>
    <section className="profile-card-modern">
      <div className="profile-big-avatar">СД</div>
      <div><strong>Сергей Д.</strong><span>Физическое лицо</span><small>Телефон +7 916 •••-••-34</small></div>
    </section>
    <section className="white-panel operation-list">
      <ActionItem icon="♙" label="Личные данные" subtitle="Телефон, e-mail, адрес"/>
      <ActionItem icon="⌘" label="Безопасность" subtitle="PIN-код, биометрия, устройства"/>
      <ActionItem icon="▣" label="Документы" subtitle="Паспорт и реквизиты"/>
      <ActionItem icon="₽" label="Цифровой рубль" subtitle="Доступ, сертификат и договор" onClick={onDigital}/>
      <ActionItem icon="◉" label="Уведомления" subtitle="Настройки сообщений"/>
      <ActionItem icon="?" label="Помощь" subtitle="Поддержка и документы"/>
    </section>
  </main>;
}

function LockScreen({
  pin, error, onDigit, onDelete, onFingerprint
}: {
  pin:string; error:boolean; onDigit:(d:string)=>void; onDelete:()=>void; onFingerprint:()=>void;
}) {
  return (
    <main className="screen lock-screen">
      <div className="lock-status"><span>21:34</span><span>● LTE　▰</span></div>
      <div className="lock-brand"><div className="lock-logo">₽</div><span>Цифровой рубль</span></div>
      <section className="lock-auth">
        <div className="lock-avatar">СД</div>
        <h1>Сергей Д.</h1>
        <p>Введите 4-значный PIN-код</p>
        <div className={"pin-dots " + (error ? "error" : "")}>
          {[0,1,2,3].map(i => <i key={i} className={i < pin.length ? 'filled' : ''}></i>)}
        </div>
        <button className="fingerprint-button" onClick={onFingerprint}>
          <span className="fingerprint-glyph">◉</span>
          <strong>Войти по отпечатку</strong>
          <small>Коснитесь датчика отпечатка пальца</small>
        </button>
      </section>
      <div className="login-keypad">
        {['1','2','3','4','5','6','7','8','9'].map(n=><button key={n} onClick={()=>onDigit(n)}>{n}</button>)}
        <button className="login-help">Забыли<br/>PIN?</button>
        <button onClick={()=>onDigit('0')}>0</button>
        <button className="login-delete" onClick={onDelete}>⌫</button>
      </div>
      <div className="lock-footer">
        <button><i>▣</i><span>Банкоматы</span></button>
        <button><i>⌂</i><span>Отделения</span></button>
        <button><i>?</i><span>Помощь</span></button>
      </div>
      <div className="gesture-bar"></div>
    </main>
  );
}

function HomeScreen({ balance, rubleBalance, onOpen, onRuble, onSavings, onCard }: { balance:number; rubleBalance:number; onOpen:()=>void; onRuble:()=>void; onSavings:()=>void; onCard:()=>void }) {
  const savingsBalance = 18500.00;
  const totalRuble = rubleBalance + savingsBalance + balance;
  return (
    <main className="screen home-screen neo-home">
      <div className="neo-top">
        <div className="profile-row">
          <div className="neo-avatar">СД</div>
          <div className="profile-copy"><span>Добрый день,</span><strong>Сергей Д.</strong></div>
          <div className="top-icons"><button>✉</button><button>♧</button></div>
        </div>
        <div className="total-card"><span>Общий баланс ◉</span><strong>{money(totalRuble)}</strong><small>Рублёвый + накопительный + цифровой рубль</small></div>
        <div className="quick-actions">
          <button><i>↗</i><span>Перевести</span></button><button><i>＋</i><span>Пополнить</span></button><button><i>▣</i><span>Оплатить</span></button><button><i>⌗</i><span>QR и СБП</span></button>
        </div>
      </div>
      <div className="content-surface">
        <div className="section-head"><h2>Счета и карты</h2><button>Все ›</button></div>
        <button className="bank-product" onClick={onRuble}><div className="product-icon blue">₽</div><div className="product-copy"><strong>Рублёвый счёт</strong><small>{RUB_ACCOUNT_MASKED}</small></div><div className="product-amount">{money(rubleBalance)}</div><b>›</b></button>
        <button className="bank-product" onClick={onSavings}><div className="product-icon soft">%</div><div className="product-copy"><strong>Накопительный счёт</strong><small>{SAV_ACCOUNT_MASKED}</small></div><div className="product-amount"><span>{money(savingsBalance)}</span><em>+ 1 250 ₽</em></div><b>›</b></button>
        <button className="bank-product digital-product" onClick={onOpen}><div className="product-icon digital">₽</div><div className="product-copy"><strong>Цифровой рубль</strong><small>{DR_ID}</small></div><div className="product-amount"><span>{money(balance)}</span><em>● Подключён</em></div><b>›</b></button>
        <div className="bank-product"><div className="product-icon violet">$</div><div className="product-copy"><strong>Счёт в долларах</strong><small>{USD_ACCOUNT_MASKED}</small></div><div className="product-amount"><span>530,40 $</span><small>в общий баланс не входит</small></div><b>›</b></div>
        <div className="bank-product"><div className="product-icon orange">€</div><div className="product-copy"><strong>Счёт в евро</strong><small>{EUR_ACCOUNT_MASKED}</small></div><div className="product-amount"><span>287,15 €</span><small>в общий баланс не входит</small></div><b>›</b></div>
        <button className="bank-product" onClick={onCard}><div className="product-icon cardmark">▰</div><div className="product-copy"><strong>Карта •••• 1234</strong><small>{CARD_MASKED}</small></div><div className="product-amount">к счёту {RUB_ACCOUNT_MASKED.slice(-7)}</div><b>›</b></button>
      </div>
    </main>
  );
}

function AccountScreen({
  balance, mode, onMode, onBack, onTopUp, onTransfer, onWithdraw, onUpk, onFeature
}: {
  balance:number; mode:ClientMode; onMode:(m:ClientMode)=>void; onBack:()=>void;
  onTopUp:()=>void; onTransfer:()=>void; onWithdraw:()=>void; onUpk:()=>void; onFeature:(k:FeatureKey)=>void;
}) {
  const [tab, setTab] = useState<AccountTab>('operations');
  const flOps: Array<[string,string,string,()=>void]> = [
    ['＋','Пополнить','С рублёвого счёта или карты',onTopUp],
    ['↓','Вывести средства','На рублёвый счёт или карту',onWithdraw],
    ['⇄','Перевести человеку','C2C по телефону или счёту ЦР',onTransfer],
    ['⌗','Оплата по УПК','C2B · сканировать QR/УПК',onUpk],
    ['◷','Автопереводы','Однократные и ежемесячные',()=>onFeature('autopay')],
    ['⌁','Оплата по УИН','C2G в бюджетную систему',()=>onFeature('c2g-uin-fl')],
    ['≡','По реквизитам в бюджет','C2G по свободным реквизитам',()=>onFeature('c2g-details-fl')],
  ];
  const ipOps: Array<[string,string,string,()=>void]> = [
    ['＋','Пополнить','С рублёвого счёта ИП',onTopUp],
    ['↓','Вывести средства','На рублёвый счёт ИП',onWithdraw],
    ['⇄','Перевод бизнесу','B2B по реквизитам ЮЛ/ИП',()=>onFeature('b2b')],
    ['↶','Возврат покупателю','B2C по исходной операции C2B',()=>onFeature('b2c-refund')],
    ['☷','Выплаты по реестру','B2C нескольким получателям',()=>onFeature('registry')],
    ['⌁','Оплата по УИН','C2G для ИП',()=>onFeature('c2g-uin-ip')],
    ['≡','В бюджет по реквизитам','C2G для ИП',()=>onFeature('c2g-details-ip')],
  ];
  const serviceOps: Array<[string,string,string,FeatureKey]> = mode==='fl' ? [
    ['◉','Уведомления','Сообщения и решения платформы','notifications-fl'],
    ['▤','Справки и документы','Запрос документов в PDF','documents-fl'],
    ['!','Ограничения','Аресты, блокировки, резерв','restrictions-fl'],
    ['✓','Согласия','Предоставление и отзыв','consents-fl'],
    ['⚙','Счёт и доступ','Реквизиты, статус, сертификат','account-manage-fl'],
  ] : [
    ['◉','Уведомления','Сообщения и решения платформы','notifications-ip'],
    ['▤','Справки и документы','Запрос документов в PDF','documents-ip'],
    ['!','Ограничения','Аресты, блокировки, резерв','restrictions-ip'],
    ['✓','Согласия','Операции от имени ИП','consents-ip'],
    ['⚙','Счёт ИП и доступ','ОГРНИП, реквизиты, сертификат','account-manage-ip'],
  ];
  const ops = mode==='fl' ? flOps : ipOps;
  return (
    <main className="screen account-screen">
      <Header title="Цифровой рубль" back onBack={onBack} />
      <div className="client-mode-switch">
        <button className={mode==='fl'?'active':''} onClick={()=>onMode('fl')}>Физлицо</button>
        <button className={mode==='ip'?'active':''} onClick={()=>onMode('ip')}>ИП</button>
      </div>
      <div className="account-card">
        <div className="product-top"><span>{mode==='fl'?'Счёт цифрового рубля':'Счёт цифрового рубля ИП'}</span><span>• 0340</span></div>
        <div className="big-balance">{money(balance)}</div>
        <div className="updated">Последние сведения · сегодня, текущее время</div>
        <div className="id-line"><span>{DR_ID}</span><span>↻</span></div>
      </div>
      <div className="account-tabs">
        <button className={tab==='operations'?'active':''} onClick={()=>setTab('operations')}>Операции</button>
        <button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>История</button>
      </div>
      {tab==='operations' ? <>
        <div className="operation-section-title">Платежи и переводы</div>
        <section className="white-panel operation-list">
          {ops.map(([icon,label,sub,click]) => <ActionItem key={label} icon={icon} label={label} subtitle={sub} onClick={click}/>)}
        </section>
        <div className="operation-section-title">Сервис и управление</div>
        <section className="white-panel operation-list">
          {serviceOps.map(([icon,label,sub,key]) => <ActionItem key={label} icon={icon} label={label} subtitle={sub} onClick={()=>onFeature(key)}/>)}
        </section>
      </> : (
        <section className="white-panel history-list">
          <div className="history-item"><div><strong>История платформы</strong><span>Запрашивается отдельно у платформы ЦР</span></div><b>›</b></div>
          <div className="history-item"><div><strong>Сессия приложения</strong><span>Все операции этой demo-сессии доступны в нижнем разделе «История»</span></div><b>›</b></div>
        </section>
      )}
      <section className="white-panel compact-info">
        <InfoRow label="Номер счёта цифрового рубля" value="40817 810 … 0034 0" />
        <InfoRow label="Идентификатор счёта" value={DR_ID} />
        <InfoRow label="Статус" value="● Активен" />
      </section>
    </main>
  );
}

function ActionItem({ icon, label, subtitle, onClick }: { icon: string; label: string; subtitle?: string; onClick?: () => void }) {
  return <button className="action-item" onClick={onClick}><span className="action-icon">{icon}</span><span className="action-copy"><strong>{label}</strong>{subtitle && <small>{subtitle}</small>}</span><b>›</b></button>;
}

function TopUpScreen(props: {
  balance: number; amount: string; bankAccount: string; valid: boolean;
  onAmount: (v: string) => void; onBankAccount: (v: string) => void;
  onBack: () => void; onContinue: () => void;
}) {
  return (
    <main className="screen flow-screen">
      <Header title="Пополнение" back onBack={props.onBack} />
      <div className="balance-banner"><span>Счёт цифрового рубля</span><strong>{money(props.balance)}</strong><small>{DR_ID}</small></div>
      <section className="white-panel form-panel">
        <h2>Пополнить счёт цифрового рубля</h2>
        <label className="field-label">Откуда</label>
        <select value={props.bankAccount} onChange={(e) => props.onBankAccount(e.target.value)}>
          <option>{RUB_ACCOUNT_MASKED}</option>
          <option>{CARD_MASKED}</option>
        </select>
        <div className="available-row"><span>Доступно</span><b>42 420,50 ₽</b></div>
        <label className="field-label">Куда</label>
        <div className="destination-card"><span className="mini-ruble">₽</span><div><strong>Счёт цифрового рубля</strong><small>• 0340&nbsp;&nbsp;{DR_ID}</small></div></div>
        <label className="field-label">Сумма</label>
        <div className="money-input"><input inputMode="decimal" value={props.amount} onChange={(e) => props.onAmount(e.target.value.replace(/[^0-9.,]/g, ''))} /><span>₽</span></div>
        <button className="primary" disabled={!props.valid} onClick={props.onContinue}>Продолжить</button>
      </section>
    </main>
  );
}

function ReviewScreen({ balance, amount, bankAccount, onBack, onConfirm }: { balance: number; amount: number; bankAccount: string; onBack: () => void; onConfirm: () => void }) {
  return (
    <main className="screen flow-screen">
      <Header title="Пополнение" back onBack={onBack} />
      <div className="balance-banner"><span>Счёт цифрового рубля</span><strong>{money(balance)}</strong><small>Последняя известная информация о балансе</small></div>
      <section className="white-panel form-panel">
        <h2>Проверьте реквизиты</h2>
        <InfoRow label="Сумма операции" value={money(amount)} />
        <InfoRow label="Счёт списания" value={bankAccount} />
        <InfoRow label="Счёт цифрового рубля" value={DR_ID} />
        <InfoRow label="Идентификатор счёта цифрового рубля" value={DR_ID} />
        <div className="notice">Для изменения суммы или счёта вернитесь на предыдущий экран.</div>
        <button className="primary" onClick={onConfirm}>Подтвердить</button>
      </section>
    </main>
  );
}

function OtpScreen({ otp, onOtp, onBack, onConfirm, operationText = 'пополнения счёта цифрового рубля' }: { otp: string; onOtp: (v: string) => void; onBack: () => void; onConfirm: () => void; operationText?: string }) {
  const ok = otp.length === 6;
  const press = (key: string) => {
    if (key === '⌫') return onOtp(otp.slice(0, -1));
    if (/^\d$/.test(key) && otp.length < 6) onOtp(otp + key);
  };
  return (
    <main className="screen flow-screen otp-screen">
      <Header title="Подтверждение" back onBack={onBack} />
      <section className="white-panel otp-card">
        <div className="otp-lock">✓</div>
        <h2>Подтвердите операцию</h2>
        <p>Вам отправлен разовый код. Введите его для подтверждения {operationText}.</p>
        <label className="field-label">Код</label>
        <div className="otp-dots">{[0,1,2,3,4,5].map(i => <span key={i} className={otp.length > i ? 'filled' : ''}>{otp.length > i ? '•' : ''}</span>)}</div>
        <div className="otp-actions"><button className="secondary" onClick={onBack}>Отменить</button><button className="primary" disabled={!ok} onClick={onConfirm}>Подтвердить</button></div>
        <button className="link-button" onClick={() => onOtp('123456')}>Для demo: подставить 123456</button>
      </section>
      <div className="numeric-keypad">
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k,i) => k ? <button key={i} onClick={() => press(k)}>{k}</button> : <span key={i}></span>)}
      </div>
    </main>
  );
}

function TransferScreen(props: {
  balance: number; recipient: string; amount: string; message: string; valid: boolean;
  onRecipient: (v: string) => void; onAmount: (v: string) => void; onMessage: (v: string) => void;
  onBack: () => void; onContinue: () => void;
}) {
  return (
    <main className="screen flow-screen">
      <Header title="Перевод цифровых рублей" back onBack={props.onBack} />
      <div className="balance-banner"><span>Доступный остаток</span><strong>{money(props.balance)}</strong><small>Счёт цифрового рубля • 0340</small></div>
      <section className="white-panel form-panel">
        <h2>Перевести другому</h2>
        <label className="field-label">Получатель средств</label>
        <div className="recipient-input-wrap">
          <input className="text-input" value={props.recipient} onChange={(e) => props.onRecipient(e.target.value)} placeholder="Телефон или номер счёта цифрового рубля" />
          <button className="contact-btn" type="button" title="Контакты">⌕</button>
        </div>
        <div className="field-help">Введите номер телефона или идентификатор счёта цифрового рубля (55 знаков).</div>
        <label className="field-label">Сумма перевода</label>
        <div className="money-input"><input inputMode="decimal" value={props.amount} onChange={(e) => props.onAmount(e.target.value.replace(/[^0-9.,]/g, ''))} /><span>₽</span></div>
        {Number(props.amount.replace(',', '.')) > props.balance && <div className="field-error">Недостаточно цифровых рублей на счёте.</div>}
        <label className="field-label">Сообщение получателю средств</label>
        <textarea className="message-input" maxLength={210} value={props.message} onChange={(e) => props.onMessage(e.target.value)} placeholder="Необязательно" />
        <div className="counter">{props.message.length}/210</div>
        <button className="primary" disabled={!props.valid} onClick={props.onContinue}>Продолжить</button>
      </section>
    </main>
  );
}

function TransferReviewScreen({ recipient, amount, message, onBack, onConfirm }: { recipient: string; amount: number; message: string; onBack: () => void; onConfirm: () => void }) {
  return (
    <main className="screen flow-screen">
      <Header title="Перевод цифровых рублей" back onBack={onBack} />
      <section className="white-panel form-panel review-panel">
        <h2>Проверьте перевод</h2>
        <div className="recipient-preview"><div className="recipient-avatar">Л</div><div><span>Получатель</span><strong>Леонид Леонидович Х.</strong><small>{recipient}</small></div></div>
        <InfoRow label="Сумма перевода" value={money(amount)} />
        <InfoRow label="Идентификатор счёта цифрового рубля получателя" value="d3f5a8e1…0e3c7a1f" />
        <InfoRow label="Имя получателя" value="Леонид Леонидович Х." />
        <InfoRow label="Сообщение получателю" value={message || '—'} />
        <div className="notice">Убедитесь, что имя получателя и сумма указаны верно. Для изменения реквизитов вернитесь на предыдущий экран.</div>
        <button className="primary" onClick={onConfirm}>Подтвердить перевод</button>
      </section>
    </main>
  );
}

function TransferResultScreen({ outcome, amount, recipient, showDetails, processingChecks, onDetails, onRefresh, onClose, onRetry }: {
  outcome: Outcome; amount: number; recipient: string; showDetails: boolean; processingChecks: number;
  onDetails: () => void; onRefresh: () => void; onClose: () => void; onRetry: () => void;
}) {
  const data = {
    success: { icon: '✓', title: 'Перевод исполнен', cls: 'ok', text: 'Цифровые рубли переведены получателю.' },
    processing: { icon: '◷', title: 'Перевод в обработке', cls: 'wait', text: 'Операция принята и ещё обрабатывается.' },
    error: { icon: '×', title: 'Перевод не выполнен', cls: 'bad', text: 'При выполнении перевода возникла ошибка.' },
  }[outcome];

  return (
    <main className="screen result-screen">
      <Header title="Перевод" />
      <div className={`result-icon ${data.cls}`}><span className="result-ruble">₽</span><b>{data.icon}</b></div>
      <h1>{data.title}</h1>
      <p>{data.text}</p>
      <div className="result-amount">{money(amount)}</div>
      <div className="result-id">Получатель: {recipient}</div>

      {outcome === 'error' && (
        <>
          <button className="text-action" onClick={onDetails}>Детально</button>
          {showDetails && <div className="error-details"><span>Сообщение</span><strong>Перевод отклонён по результатам контрольных проверок.</strong><small>Код mock: DR-TRANSFER-CONTROL</small></div>}
          <button className="secondary" onClick={onRetry}>Повторить</button>
        </>
      )}
      {outcome === 'processing' && (
        <div className="processing-box">
          <button className="secondary" onClick={onRefresh}>Обновить</button>
          <small>Проверок статуса: {processingChecks}. В demo после второй проверки перевод завершится.</small>
        </div>
      )}
      <button className="primary" onClick={onClose}>Закрыть</button>
    </main>
  );
}


function WithdrawScreen({ balance, amount, destination, onAmount, onDestination, onBack, onContinue }: {
  balance:number; amount:string; destination:string; onAmount:(v:string)=>void; onDestination:(v:string)=>void; onBack:()=>void; onContinue:()=>void;
}) {
  const n = Number(amount.replace(',', '.')) || 0;
  return <main className="screen flow-screen">
    <Header title="Вывести средства" back onBack={onBack} />
    <div className="balance-banner"><span>Откуда</span><strong>{money(balance)}</strong><small>Цифровой рубль • 0340 · {DR_ID}</small></div>
    <section className="white-panel form-panel">
      <h2>Куда вывести</h2>
      <label className="field-label">Получатель средств</label>
      <div className="destination-choices">
        <button className={destination===RUB_ACCOUNT_MASKED?'selected':''} onClick={()=>onDestination(RUB_ACCOUNT_MASKED)}><span className="choice-icon">₽</span><div><strong>Рублёвый счёт</strong><small>{RUB_ACCOUNT_MASKED}</small></div></button>
        <button className={destination===CARD_MASKED?'selected':''} onClick={()=>onDestination(CARD_MASKED)}><span className="choice-icon">▰</span><div><strong>Карта •••• 1234</strong><small>{CARD_MASKED}</small></div></button>
      </div>
      <label className="field-label">Сумма</label>
      <div className="money-input"><input inputMode="decimal" value={amount} onChange={e=>onAmount(e.target.value.replace(/[^0-9.,]/g,''))}/><span>₽</span></div>
      {n>balance && <div className="field-error">Недостаточно цифровых рублей.</div>}
      <div className="available-row"><span>Комиссия</span><b>0,00 ₽</b></div>
      <button className="primary" disabled={n<=0 || n>balance} onClick={onContinue}>Продолжить</button>
    </section>
  </main>;
}

function WithdrawReviewScreen({ amount, destination, onBack, onConfirm }:{amount:number;destination:string;onBack:()=>void;onConfirm:()=>void}) {
  return <main className="screen flow-screen">
    <Header title="Вывести средства" back onBack={onBack}/>
    <section className="white-panel form-panel review-panel">
      <h2>Проверьте реквизиты</h2>
      <InfoRow label="Откуда" value={`Цифровой рубль • 0340`} />
      <InfoRow label="Идентификатор" value={DR_ID} />
      <InfoRow label="Куда" value={destination} />
      <InfoRow label="Сумма" value={money(amount)} />
      <InfoRow label="Комиссия" value="0,00 ₽" />
      <InfoRow label="Итого к списанию" value={money(amount)} />
      <button className="primary" onClick={onConfirm}>Вывести</button>
    </section>
  </main>;
}

function UpkScanScreen({onBack,onScanned}:{onBack:()=>void;onScanned:()=>void}) {
  return <main className="screen flow-screen scanner-screen">
    <Header title="Оплата по УПК" back onBack={onBack}/>
    <div className="camera-view">
      <div className="camera-glow"></div>
      <div className="scan-frame"><div className="fake-qr">▦</div></div>
      <strong>Наведите камеру на QR-код УПК</strong>
      <span>QR-код будет распознан автоматически</span>
    </div>
    <div className="scan-actions">
      <button className="secondary">Выбрать из галереи</button>
      <button className="primary" onClick={onScanned}>Сканировать тестовый УПК</button>
    </div>
  </main>;
}

function UpkDetailsScreen({balance,amount,onBack,onContinue}:{balance:number;amount:number;onBack:()=>void;onContinue:()=>void}) {
  return <main className="screen flow-screen">
    <Header title="Оплата по УПК" back onBack={onBack}/>
    <section className="white-panel form-panel">
      <div className="merchant-card"><div className="merchant-icon">☕</div><div><span>Получатель</span><strong>Кофейня «Город»</strong><small>ИНН 7704••••21</small></div></div>
      <h2>Расшифровка УПК</h2>
      <InfoRow label="За что" value="Заказ № 1842 · кофе и десерт" />
      <InfoRow label="Сумма" value={money(amount)} />
      <InfoRow label="Комиссия" value="0,00 ₽" />
      <InfoRow label="Счёт списания" value={`Цифровой рубль • 0340`} />
      <InfoRow label="Доступно" value={money(balance)} />
      <button className="primary" onClick={onContinue}>Продолжить</button>
    </section>
  </main>;
}

function UpkReviewScreen({amount,onBack,onConfirm}:{amount:number;onBack:()=>void;onConfirm:()=>void}) {
  return <main className="screen flow-screen">
    <Header title="Проверка платежа" back onBack={onBack}/>
    <section className="white-panel form-panel review-panel">
      <h2>Проверьте реквизиты</h2>
      <InfoRow label="Кому" value="Кофейня «Город»" />
      <InfoRow label="За что" value="Заказ № 1842 · кофе и десерт" />
      <InfoRow label="Сумма" value={money(amount)} />
      <InfoRow label="Комиссия" value="0,00 ₽" />
      <InfoRow label="Итого" value={money(amount)} />
      <InfoRow label="Счёт списания" value="Цифровой рубль • 0340" />
      <button className="primary" onClick={onConfirm}>Подтвердить оплату</button>
    </section>
  </main>;
}



function FeatureScreen({ spec, onBack, onContinue }: { spec: FeatureSpec; onBack:()=>void; onContinue:()=>void }) {
  return <main className="screen flow-screen">
    <Header title={spec.title} back onBack={onBack}/>
    <section className="feature-hero">
      <div className="feature-hero-icon">{spec.icon}</div>
      <div><strong>{spec.title}</strong><span>{spec.subtitle}</span></div>
    </section>
    <section className="white-panel form-panel">
      <h2>{spec.monetary ? 'Введите данные операции' : 'Информация'}</h2>
      <div className="feature-fields">
        {spec.inputRows.map(([label,value],i)=><div className="feature-field" key={i}><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      <div className="notice">Demo-сценарий. На боевом интерфейсе значения заполняются пользователем либо приходят от платформы цифрового рубля.</div>
      <button className="primary" onClick={onContinue}>{spec.monetary ? 'Продолжить' : 'Подробнее'}</button>
    </section>
  </main>;
}

function FeatureReviewScreen({ spec, onBack, onConfirm }: { spec: FeatureSpec; onBack:()=>void; onConfirm:()=>void }) {
  return <main className="screen flow-screen">
    <Header title={spec.monetary ? 'Проверка операции' : spec.title} back onBack={onBack}/>
    <section className="white-panel form-panel review-panel">
      <h2>{spec.monetary ? 'Проверьте реквизиты' : 'Детали'}</h2>
      {spec.reviewRows.map(([label,value],i)=><InfoRow key={i} label={label} value={value}/>)}
      {spec.monetary && <InfoRow label="Счёт цифрового рубля" value="• 0340 · 6f3a2e1b…e5f6a7b"/>}
      <button className="primary" onClick={onConfirm}>{spec.monetary ? 'Подтвердить' : 'Обновить / выполнить действие'}</button>
    </section>
  </main>;
}

function HistoryScreen({ operations, onBack }: { operations: SessionOperation[]; onBack: () => void }) {
  return <main className="screen history-screen">
    <Header title="История" back onBack={onBack} />
    <section className="history-summary">
      <span>Операции за текущую сессию</span>
      <strong>{operations.length}</strong>
    </section>
    <section className="history-list">
      {operations.length === 0 ? (
        <div className="history-empty">
          <div className="history-empty-icon">◷</div>
          <h2>Операций пока нет</h2>
          <p>Здесь появятся все успешные приходные и расходные операции, выполненные в этой сессии.</p>
        </div>
      ) : operations.map(op => (
        <div className="history-item" key={op.id}>
          <div className={`history-op-icon ${op.kind}`}>{op.kind === 'income' ? '↓' : '↑'}</div>
          <div className="history-op-copy">
            <strong>{op.title}</strong>
            <span>{op.subtitle}</span>
            <small>{op.createdAt}</small>
          </div>
          <div className={`history-amount ${op.kind}`}>
            {op.kind === 'income' ? '+' : '−'}{money(op.amount)}
          </div>
        </div>
      ))}
    </section>
  </main>;
}

function SimpleResult({title,amount,success,onClose}:{title:string;amount:number;success:boolean;onClose:()=>void}) {
  return <main className="screen result-screen">
    <Header title="Результат"/>
    <div className={`result-icon ${success?'ok':'wait'}`}><span className="result-ruble">₽</span><b>{success?'✓':'◷'}</b></div>
    <h1>{title}</h1>
    <div className="result-amount">{money(amount)}</div>
    <div className="result-id">{DR_ID}</div>
    <button className="primary" onClick={onClose}>Закрыть</button>
  </main>;
}

function ResultScreen({ outcome, amount, balance, showDetails, processingChecks, onDetails, onRefresh, onClose, onRetry }: {
  outcome: Outcome; amount: number; balance: number; showDetails: boolean; processingChecks: number;
  onDetails: () => void; onRefresh: () => void; onClose: () => void; onRetry: () => void;
}) {
  const data = {
    success: { icon: '✓', title: 'Пополнение выполнено', cls: 'ok', text: 'Счёт цифрового рубля успешно пополнен.' },
    processing: { icon: '◷', title: 'Счёт в процессе пополнения', cls: 'wait', text: 'Операция принята платформой и ещё обрабатывается.' },
    error: { icon: '×', title: 'Ошибка при пополнении счёта', cls: 'bad', text: 'Пополнение не выполнено.' },
  }[outcome];

  return (
    <main className="screen result-screen">
      <Header title="Пополнение" />
      <div className={`result-icon ${data.cls}`}><span className="result-ruble">₽</span><b>{data.icon}</b></div>
      <h1>{data.title}</h1>
      <p>{data.text}</p>
      <div className="result-amount">{money(outcome === 'success' ? balance : amount)}</div>
      <div className="result-id">{DR_ID}</div>

      {outcome === 'error' && (
        <>
          <button className="text-action" onClick={onDetails}>Детально</button>
          {showDetails && <div className="error-details"><span>Сообщение</span><strong>Операция отклонена. Счёт получателя заблокирован Платформой цифрового рубля.</strong><small>Код mock: DR-ACCOUNT-BLOCKED</small></div>}
          <button className="secondary" onClick={onRetry}>Повторить</button>
        </>
      )}

      {outcome === 'processing' && (
        <div className="processing-box">
          <button className="secondary" onClick={onRefresh}>Обновить</button>
          <small>Проверок статуса: {processingChecks}. В demo после второй проверки операция завершится.</small>
        </div>
      )}

      <button className="primary" onClick={onClose}>Закрыть</button>
    </main>
  );
}

function BankSpinner({ text }: { text: string }) {
  return <div className="bank-loading"><div className="loading-modal"><div className="dr-spinner"><div className="spinner-ring"></div><div className="spinner-logo">₽</div></div><strong>{text}</strong><span>Это займёт несколько секунд</span></div></div>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="info-row"><span>{label}</span><strong>{value}</strong></div>;
}

function BottomNav({
  active, onHome, onPayments, onHistory, onProducts, onProfile
}: {
  active:'home'|'payments'|'history'|'products'|'profile';
  onHome:()=>void; onPayments:()=>void; onHistory:()=>void; onProducts:()=>void; onProfile:()=>void;
}) {
  return <nav className="bottom-nav">
    <button className={active==='home'?'active':''} onClick={onHome}><span>⌂</span>Главная</button>
    <button className={active==='payments'?'active':''} onClick={onPayments}><span>▣</span>Платежи</button>
    <button className={active==='history'?'active':''} onClick={onHistory}><span>◷</span>История</button>
    <button className={active==='products'?'active':''} onClick={onProducts}><span>▦</span>Продукты</button>
    <button className={active==='profile'?'active':''} onClick={onProfile}><span>♙</span>Профиль</button>
  </nav>;
}



const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
