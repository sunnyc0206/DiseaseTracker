import { motion } from 'framer-motion';
import {
  GlobeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BeakerIcon,
  AcademicCapIcon,
  MailIcon,
  ExternalLinkIcon,
  HeartIcon,
  ChartBarIcon,
  NewspaperIcon,
  MapIcon,
  ExclamationCircleIcon
} from '@heroicons/react/outline';

const About = () => {
  const features = [
    {
      icon: ChartBarIcon,
      title: 'Real-time Monitoring',
      description: 'Track disease outbreaks and health emergencies as they happen worldwide.'
    },
    {
      icon: MapIcon,
      title: 'Interactive World Map',
      description: 'Visualize disease distribution across countries with our interactive mapping tools.'
    },
    {
      icon: NewspaperIcon,
      title: 'News Aggregation',
      description: 'Stay informed with the latest health news from trusted sources.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Prevention Guidelines',
      description: 'Access prevention methods and treatment information for various diseases.'
    }
  ];

  const dataSources = [
    {
      name: 'Disease.sh API',
      description: 'Real-time COVID-19 and disease statistics',
      url: 'https://disease.sh'
    },
    {
      name: 'World Health Organization (WHO)',
      description: 'Global health data and guidelines',
      url: 'https://www.who.int'
    },
    {
      name: 'Centers for Disease Control (CDC)',
      description: 'Disease prevention and control data',
      url: 'https://www.cdc.gov'
    }
  ];

  const team = [
    {
      role: 'Development Team',
      description: 'Full-stack developers passionate about global health'
    },
    {
      role: 'Data Scientists',
      description: 'Experts in epidemiological data analysis'
    },
    {
      role: 'Health Advisors',
      description: 'Medical professionals ensuring data accuracy'
    }
  ];

  const faqs = [
    {
      question: 'How often is the data updated?',
      answer: 'COVID-19 data is updated in real-time from our APIs. Other disease data is updated based on availability from health organizations, typically daily or weekly.'
    },
    {
      question: 'Is this data reliable?',
      answer: 'We source our data from trusted organizations like WHO, CDC, and established health APIs. However, always consult healthcare professionals for medical advice.'
    },
    {
      question: 'Can I use this data for research?',
      answer: 'Yes, but please verify with original sources and cite appropriately. This platform aggregates data for visualization and awareness purposes.'
    },
    {
      question: 'How are disease severity levels determined?',
      answer: 'Severity levels are based on factors like mortality rate, transmission rate, and global impact, following WHO and CDC guidelines.'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          About World Disease Tracker
        </h1> */}
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Empowering global health awareness through real-time disease monitoring and data visualization
        </p>
      </motion.div>

      {/* Mission Statement */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
      >
        <div className="flex items-start gap-4">
          <HeartIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              World Disease Tracker (WDT) is dedicated to providing accessible, real-time information about global disease outbreaks 
              and health emergencies. We believe that informed communities are healthier communities. By aggregating 
              data from trusted sources and presenting it in an intuitive interface, we aim to help individuals, 
              researchers, and health organizations make better-informed decisions about public health.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="card flex gap-4"
            >
              <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Data Sources */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Data Sources & Credibility</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dataSources.map((source, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="card hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{source.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{source.description}</p>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
              >
                Visit Source
                <ExternalLinkIcon className="w-4 h-4 ml-1" />
              </a>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Data Update Frequency</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Disease data updates vary based on source availability, typically ranging from daily to weekly updates. All data timestamps are displayed for transparency.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Team */}
      {/* <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="card text-center"
            >
              <UserGroupIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{member.role}</h3>
              <p className="text-gray-600 dark:text-gray-400">{member.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section> */}

      {/* FAQs */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="card"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 ml-7">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Resources */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Helpful Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Health Organizations</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.who.int" target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  World Health Organization (WHO)
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://www.cdc.gov" target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  Centers for Disease Control and Prevention (CDC)
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://www.ecdc.europa.eu" target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  European Centre for Disease Prevention and Control
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Emergency Contacts</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• WHO Health Emergency Hotline: +41-22-791-2111</li>
              <li>• CDC Emergency Operations: 1-770-488-7100</li>
              <li>• Local emergency services: Call your country's emergency number</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Disclaimer */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="card border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
      >
        <div className="flex items-start gap-3">
          <ExclamationCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-3">Important Disclaimer</h2>
            <p className="text-red-700 dark:text-red-300 mb-3">
              World Disease Tracker (WDT) is an informational platform only. The data and information provided here are for 
              educational and awareness purposes and should NOT be used as a substitute for professional medical advice, 
              diagnosis, or treatment.
            </p>
            <p className="text-red-700 dark:text-red-300">
              Always seek the advice of your physician or other qualified health provider with any questions you may 
              have regarding a medical condition. Never disregard professional medical advice or delay in seeking it 
              because of something you have read on this platform.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Contact */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="card text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Have questions, suggestions, or want to contribute? We'd love to hear from you!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="mailto:contact@worlddiseasetracker.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            <MailIcon className="w-5 h-5" />
            Contact Us
          </a>
          <a
            href="https://github.com/yourusername/disease-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub Repository
          </a>
        </div>
      </motion.section>
    </div>
  );
};

export default About; 