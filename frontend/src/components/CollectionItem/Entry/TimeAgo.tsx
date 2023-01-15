import jsTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

export function TimeAgo(props: { timestamp: string | Date | number }) {
  jsTimeAgo.addDefaultLocale(en);
  const formatter = new jsTimeAgo('en-US');

  const date = (): Date | number => {
    try {
      if (typeof props.timestamp === 'string') {
        return Date.parse(props.timestamp.replace('GMT', '') + 'Z');
      } else {
        return props.timestamp;
      }
    } catch (e) {
      console.warn(e);
      return 0;
    }
  };

  return <>{formatter.format(date())}</>;
}
