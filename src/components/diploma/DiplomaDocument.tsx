'use client';

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

// Colors matching the Lettoria brand
const colors = {
  green: '#2D7D46',
  gold: '#FFD700',
  darkGold: '#DAA520',
  cream: '#FEF9EF',
  darkText: '#333333',
  lightText: '#666666',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.cream,
    padding: 0,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  // Decorative border layers
  outerBorder: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderWidth: 3,
    borderColor: colors.green,
    borderStyle: 'solid',
  },
  innerBorder: {
    position: 'absolute',
    top: 22,
    left: 22,
    right: 22,
    bottom: 22,
    borderWidth: 2,
    borderColor: colors.gold,
    borderStyle: 'solid',
  },
  // Main content container
  content: {
    flex: 1,
    paddingTop: 25,
    paddingBottom: 15,
    paddingHorizontal: 50,
    alignItems: 'center',
  },
  // Header section with stars and Eric
  headerSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
  },
  ericImage: {
    width: 70,
    height: 70,
  },
  // Title section
  titleSection: {
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 42,
    fontFamily: 'Helvetica-Bold',
    color: colors.green,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 12,
    color: colors.lightText,
    marginTop: 4,
  },
  // Name section
  nameSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: '100%',
  },
  nameUnderline: {
    borderBottomWidth: 2,
    borderBottomColor: colors.green,
    borderBottomStyle: 'solid',
    paddingBottom: 4,
    paddingHorizontal: 40,
  },
  name: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkText,
    textAlign: 'center',
  },
  // Achievement text
  achievementText: {
    fontSize: 13,
    color: colors.lightText,
    textAlign: 'center',
    lineHeight: 1.4,
    marginTop: 4,
  },
  // Stats row
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  statBox: {
    alignItems: 'center',
    marginHorizontal: 25,
    minWidth: 70,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: colors.green,
  },
  statLabel: {
    fontSize: 9,
    color: colors.lightText,
    marginTop: 2,
  },
  // Regions row
  regionsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  // Footer section
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 30,
    marginTop: 20,
  },
  // Date column
  dateColumn: {
    alignItems: 'flex-start',
    width: 120,
  },
  dateLabel: {
    fontSize: 8,
    color: colors.lightText,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 11,
    color: colors.darkText,
  },
  // Signature column (center)
  signatureColumn: {
    alignItems: 'center',
    flex: 1,
  },
  signatureImage: {
    width: 45,
    height: 45,
    marginBottom: 3,
  },
  signatureName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.green,
  },
  signatureTitle: {
    fontSize: 8,
    color: colors.lightText,
  },
  // Seal column
  sealColumn: {
    alignItems: 'flex-end',
    width: 150,
  },
  sealImage: {
    width: 140,
    height: 140,
  },
  // Website link
  websiteText: {
    fontSize: 9,
    color: colors.green,
    textAlign: 'center',
    marginTop: 4,
  },
});

// Region images for the diploma
const regionImages = [
  '/images/diploma/region-grot.png',
  '/images/diploma/region-dorp.png',
  '/images/diploma/region-velden.png', // TODO: needs to be created
  '/images/diploma/region-woud.png',
  '/images/diploma/region-toppen.png',
  '/images/diploma/region-zee.png',
  '/images/diploma/region-kasteel.png',
];

interface DiplomaDocumentProps {
  name: string;
  date: string;
}

export function DiplomaDocument({ name, date }: DiplomaDocumentProps) {
  const displayName = name.trim() || 'Typkampioen';

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Decorative borders */}
        <View style={styles.outerBorder} />
        <View style={styles.innerBorder} />

        <View style={styles.content}>
          {/* Header with stars and Eric */}
          <View style={styles.headerSection}>
            <View style={styles.starsRow}>
              {[...Array(5)].map((_, i) => (
                <Image
                  key={i}
                  src="/images/diploma/star.png"
                  style={{ width: 32, height: 32, marginHorizontal: 4 }}
                />
              ))}
            </View>
            <Image src="/images/eric/eric-celebrating.png" style={styles.ericImage} />
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>DIPLOMA</Text>
            <Text style={styles.subtitle}>Lettoria Typmeester</Text>
          </View>

          {/* Name with underline */}
          <View style={styles.nameSection}>
            <View style={styles.nameUnderline}>
              <Text style={styles.name}>{displayName}</Text>
            </View>
          </View>

          {/* Achievement text */}
          <Text style={styles.achievementText}>
            heeft alle 26 lessen van Lettoria succesvol voltooid en is nu een officiële Typmeester!
          </Text>

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>26</Text>
              <Text style={styles.statLabel}>Lessen</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>78</Text>
              <Text style={styles.statLabel}>Sterren</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Regio&apos;s</Text>
            </View>
          </View>

          {/* Region icons */}
          <View style={styles.regionsSection}>
            {regionImages.map((src, i) => (
              <Image
                key={i}
                src={src}
                style={{ width: 24, height: 24, marginHorizontal: 3 }}
              />
            ))}
          </View>

          {/* Website */}
          <Text style={styles.websiteText}>www.lettoria.nl</Text>

          {/* Footer with date, signature, seal */}
          <View style={styles.footerSection}>
            {/* Date */}
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Uitgereikt op</Text>
              <Text style={styles.dateValue}>{date}</Text>
            </View>

            {/* Eric's signature */}
            <View style={styles.signatureColumn}>
              <Image src="/images/eric/eric-happy.png" style={styles.signatureImage} />
              <Text style={styles.signatureName}>Eric de Draak</Text>
              <Text style={styles.signatureTitle}>Beschermer van Lettoria</Text>
            </View>

            {/* Seal */}
            <View style={styles.sealColumn}>
              <Image src="/images/diploma/lettoria_seal.png" style={styles.sealImage} />
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
