import jsTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

export function TimeAgo(props: { timestamp: string | Date | number }) {
  jsTimeAgo.addDefaultLocale(en);
  const formatter = new jsTimeAgo('en-US');

  const date = (): Date | number => {
    if (typeof props.timestamp === 'string') {
      return Date.parse(props.timestamp.replace('GMT', '') + 'UTC');
    } else {
      return props.timestamp;
    }
  };

  return <>{formatter.format(date())}</>;
}
