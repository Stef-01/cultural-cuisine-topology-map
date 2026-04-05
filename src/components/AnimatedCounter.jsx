import useAnimatedValue from '../hooks/useAnimatedValue';

/**
 * Displays an animated counting number
 * @param {number} target - Target number to count to
 * @param {number} duration - Animation duration in milliseconds
 * @param {string} prefix - Text to display before the number
 * @param {string} suffix - Text to display after the number
 * @param {number} decimals - Number of decimal places to show
 */
const AnimatedCounter = ({
  target,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const animatedValue = useAnimatedValue(target, duration, true);

  const formattedValue = animatedValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
